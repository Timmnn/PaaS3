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
import axios from 'axios';

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
	.query(async (opts): ApiResponse<InferSelectModel<typeof schema.projects>> => {
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

		return {
			success: true,
			data: projects[0]
		};
	});

const getProjects = publicProcedure.query(
	async (): ApiResponse<InferSelectModel<typeof schema.projects>[]> => {
		console.log('getProjects');
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

		const projects = await db.select().from(schema.projects);

		return {
			success: true,
			data: projects
		};
	}
);

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
			>
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

		let project;
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

		let deployment;

		console.log('created project', project);

		const source_folder = await sourceManager.pullSource({
			type: 'public-git',
			sourceUrl: opts.input.git_repo_url
		});

		const exposed_ports = await deploymentManager.deployProject(project, source_folder);

		await nginxManager.updateNginxConfig(await db.select().from(schema.deployments), exposed_ports);

		return {
			success: true,
			data: project
		};
	});

const getProjectHealth = publicProcedure
	.input(z.number().refine((id) => id > 0, { message: 'Invalid project id' }))
	.query(async (opts): ApiResponse<'running' | 'stopped'> => {
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

		// check if the project is running

		const { healthcheck_url, domain } = project;

		// check if the project is running

		console.log('healthcheck', `http://${domain}${healthcheck_url}`);
		const response = await fetch(`http://${domain}${healthcheck_url}`).catch((e) => {
			console.error('healthcheck failed', e);
			return null;
		});

		if (response?.status === 200) {
			return {
				success: true,
				data: 'running'
			};
		}

		return {
			success: true,
			data: 'stopped'
		};
	});

// ---------------------
// Express
// ---------------------

const appRouter = router({
	getProject,
	getProjects,
	createProject,
	getProjectHealth
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
