import { z } from 'zod';
import { useDb } from '../../lib/useDB';
import { publicProcedure } from '../router';
import * as schema from '../../drizzle/schema';
import { type InferSelectModel } from 'drizzle-orm';
import SourceManager from '../../lib/SourceManager';
import DeploymentManager from '../../lib/DeploymentManager';

const sourceManager = new SourceManager();
const deploymentManager = new DeploymentManager();
const createProject = publicProcedure
	.input(
		//TODO: this type sucks (it's too long)
		z.custom<
			Pick<
				InferSelectModel<typeof schema.projects>,
				| 'description'
				| 'domain'
				| 'name'
				| 'project_source'
				| 'healthcheck_url'
				| 'build_command'
				| 'exposed_port'
			> & {
				env_variables: { key: string; value: string }[];
				docker_compose_config?: string;
				git_repo_url?: string;
				docker_compose_config_location?: string;
				dockerfile_content?: string;
			}
		>()
	)
	.mutation(async (opts) => {
		const db = await useDb();
		if (!db) {
			console.error('Failed to connect to database');
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
						.values([
							{
								description: opts.input.description,
								domain: opts.input.domain,
								git_repo_url: opts.input.git_repo_url,
								name: opts.input.name,
								project_source: opts.input.project_source,
								healthcheck_url: opts.input.healthcheck_url,
								build_command: opts.input.build_command,
								docker_compose_config: opts.input.docker_compose_config,
								docker_compose_config_location: opts.input.docker_compose_config_location,
								exposed_port: opts.input.exposed_port,
								dockerfile_content: opts.input.dockerfile_content
							}
						])
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

			if (env_variables.length > 0) {
				await db.insert(schema.project_env_variables).values(env_variables);
			}

			let deployment;

			const source = (opts.input.git_repo_url ||
				opts.input.docker_compose_config ||
				opts.input.dockerfile_content) as string;

			if (!source) {
				console.error('No source provided');
				return {
					success: false,
					error: {
						code: 400,
						message: 'No source provided'
					}
				};
			}

			await sourceManager.pullSource({
				type: project.project_source,
				source,
				project_id: project.id
			});

			await deploymentManager.deployProject(
				project,
				sourceManager.getDirName({ project_id: project.id })
			);

			return {
				success: true,
				data: project
			};
		});
	});

export default createProject;
