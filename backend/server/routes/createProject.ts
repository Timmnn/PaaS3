import { z } from 'zod';
import { useDb } from '../../lib/useDB';
import { publicProcedure } from '../router';
import * as schema from '../../drizzle/schema';
import { type InferSelectModel } from 'drizzle-orm';
import SourceManager from '../../lib/SourceManager';
import NginxManager from '../../lib/NginxManager';

const sourceManager = new SourceManager();
const nginxManager = new NginxManager();

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

			let deployment;

			const source_folder = await sourceManager.pullSource({
				type: 'public-git',
				sourceUrl: opts.input.git_repo_url,
				project_id: project.id
			});

			await nginxManager.updateNginxConfig(await db.select().from(schema.deployments));

			return {
				success: true,
				data: project
			};
		});
	});

export default createProject;
