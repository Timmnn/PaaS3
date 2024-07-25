import type { Express } from 'express';
import bodyparser from 'body-parser';
import { connectToDb } from '../../src/lib/server/connectToDb';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import * as trpcExpress from '@trpc/server/adapters/express';
import { type InferSelectModel, eq } from 'drizzle-orm';
import NginxManager from '../lib/NginxManager';
import SourceManager from '../lib/SourceManager';
import DeploymentManager from '../lib/DeploymentManager';

const nginxManager = new NginxManager();
const sourceManager = new SourceManager();
const deploymentManager = new DeploymentManager();

// ---------------------
// API Response types
// ---------------------
interface SuccessResponse<T> {
	success: true;
	data: T;
}

interface ErrorResponse {
	success: false;
	error: {
		code: number;
		message: string;
	};
}

type ApiResponse<T> = Promise<SuccessResponse<T> | ErrorResponse>;

type ProjectWithHealth = InferSelectModel<typeof schema.projects> & {
	health: HealthcheckResponse;
};

// ---------------------
// tRPC
// ---------------------

const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({});
type Context = Awaited<ReturnType<typeof createContext>>;
const trpc = initTRPC.context<Context>().create();

const router = trpc.router;
const publicProcedure = trpc.procedure;

// ---------------------
// DB Connection
// ---------------------

let _db = null as null | ReturnType<typeof drizzle>;
async function useDb(): Promise<ReturnType<typeof drizzle> | null> {
	if (_db) {
		return _db;
	}

	const maybeDb = await connectToDb();

	if (maybeDb instanceof Error) {
		return null;
	}

	_db = maybeDb.db;

	return _db;
}

// ---------------------
// Procedures
// ---------------------

const getProject = publicProcedure
	.input(z.number().refine((id) => id > 0, { message: 'Invalid project id' }))
	.query(async (opts): ApiResponse<ProjectWithHealth> => {
		const id = opts.input;
		const db = await useDb();
		if (!db) {
			return {
				success: false,
				error: {
					code: 500,
					message: 'Failed to connect to database'
				}
			};
		}
		const projects = await db.select().from(schema.projects).where(eq(schema.projects.id, id));

		if (!projects.length) {
			return {
				success: false,
				error: {
					code: 404,
					message: 'Project not found'
				}
			};
		}

		const health = await getProjectHealthFunction(projects[0]);

		const project = {
			...projects[0],
			health
		};

		return {
			success: true,
			data: project
		};
	});

type GetProjectsResponse = ProjectWithHealth[];
const getProjects = publicProcedure.query(async (): ApiResponse<GetProjectsResponse> => {
	const db = await useDb();
	if (!db) {
		return {
			success: false,
			error: {
				code: 500,
				message: 'Failed to connect to database'
			}
		};
	}

	console.log('getting projects');

	const projects = await db.select().from(schema.projects);

	const healthchecks = projects.map(async (project) => {
		return await getProjectHealthFunction(project);
	});

	const healthchecksResolved = await Promise.all(healthchecks);

	const projects_with_health = projects.map((project) => ({
		...project,
		health: healthchecksResolved[project.id]
	}));

	console.log('projects_with_health', projects_with_health);

	return {
		success: true,
		data: projects_with_health
	};
});

const createProject = publicProcedure
	.input(
		z.custom<
			Pick<
				InferSelectModel<typeof schema.projects>,
				| 'description'
				| 'domain'
				| 'git_repo_url'
				| 'name'
				| 'project_source'
				| 'healthcheck_url'
				| 'build_command'
			> & { env_variables: { key: string; value: string }[] }
		>()
	)
	.mutation(async (opts) => {
		const db = await useDb();
		if (!db) {
			return {
				success: false,
				error: {
					code: 500,
					message: 'Failed to connect to database'
				}
			};
		}
		let project: InferSelectModel<typeof schema.projects>;

		await db.transaction(async (tx) => {
			try {
				project = (
					await db
						.insert(schema.projects)
						.values({
							description: opts.input.description,
							domain: opts.input.domain,
							git_repo_url: opts.input.git_repo_url,
							name: opts.input.name,
							project_source: opts.input.project_source,
							healthcheck_url: opts.input.healthcheck_url,
							build_command: opts.input.build_command
						})
						.returning()
				)[0];
			} catch (e) {
				console.error('Failed to create project', e);
				return {
					success: false,
					error: {
						code: 500,
						message: 'Failed to create project'
					}
				};
			}

			const env_variables = opts.input.env_variables.map((env) => ({
				...env,
				project_id: project.id
			}));

			await db.insert(schema.project_env_variables).values(env_variables);
		});

		let deployment;

		const source_folder = await sourceManager.pullSource({
			type: 'public-git',
			sourceUrl: opts.input.git_repo_url,
			project_id: project.id
		});

		const exposed_ports = await deploymentManager.deployProject(project, source_folder);

		await nginxManager.updateNginxConfig(await db.select().from(schema.deployments), exposed_ports);

		return {
			success: true,
			data: project
		};
	});

type HealthcheckResponse = 'running' | 'stopped';
const getProjectHealth = publicProcedure
	.input(z.number().refine((id) => id > 0, { message: 'Invalid project id' }))
	.query(async (opts): ApiResponse<HealthcheckResponse> => {
		const db = await useDb();
		if (!db) {
			return {
				success: false,
				error: {
					code: 500,
					message: 'Failed to connect to database'
				}
			};
		}

		const project = (
			await db.select().from(schema.projects).where(eq(schema.projects.id, opts.input))
		)[0];

		if (!project) {
			return {
				success: false,
				error: {
					code: 404,
					message: 'Project not found'
				}
			};
		}

		let state = 'stopped';
		try {
			state = await getProjectHealthFunction(project);
		} catch (e) {
			console.error('Failed to check health', e);
			state = 'stopped';
		}

		return {
			success: true,
			data: state as HealthcheckResponse
		};
	});

async function getProjectHealthFunction(
	project: InferSelectModel<typeof schema.projects>
): Promise<HealthcheckResponse> {
	const { domain, healthcheck_url } = project;
	return await fetch(`http://${domain}${healthcheck_url}`)
		.then((response) => {
			if (response.status === 200) {
				return 'running' as const;
			}

			return 'stopped' as const;
		})
		.catch(() => {
			return 'stopped' as const;
		});
}

const startProject = publicProcedure
	.input(z.number().refine((id) => id > 0, { message: 'Invalid project id' }))
	.mutation(async (opts): ApiResponse<void> => {
		const db = await useDb();
		if (!db) {
			return {
				success: false,
				error: {
					code: 500,
					message: 'Failed to connect to database'
				}
			};
		}

		const project = (
			await db.select().from(schema.projects).where(eq(schema.projects.id, opts.input))
		)[0];

		if (!project) {
			return {
				success: false,
				error: {
					code: 404,
					message: 'Project not found'
				}
			};
		}

		await deploymentManager.startProject(sourceManager.getDirName({ project_id: project.id }));

		return {
			success: true,
			data: void 0
		};
	});

// ---------------------
// Express
// ---------------------

const appRouter = router({
	getProject,
	getProjects,
	createProject,
	getProjectHealth,
	startProject
});

export type AppRouter = typeof appRouter;

const app = require('express')() as Express;
app.use(bodyparser.json());
require('dotenv').config();
const PORT = 3001;

app.use(
	'/trpc',
	trpcExpress.createExpressMiddleware({
		router: appRouter,
		createContext
	})
);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
