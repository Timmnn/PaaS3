import { z } from 'zod';
import { useDb } from '../../lib/useDB';
import { publicProcedure } from '../router';
import SourceManager from '../../lib/SourceManager';
import DeploymentManager from '../../lib/DeploymentManager';
import { ApiResponse } from '../types';
import * as schema from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

const sourceManager = new SourceManager();
const deploymentManager = new DeploymentManager();

const deleteProject = publicProcedure
	.input(z.number().refine((id) => id > 0, { message: 'Invalid project id' }))
	.mutation(async (opts): ApiResponse<void> => {
		console.log('deleteProject');
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

		db.transaction(async (tx) => {
			await tx
				.delete(schema.project_env_variables)
				.where(eq(schema.project_env_variables.project_id, opts.input));

			const deleted_proj = await tx
				.delete(schema.projects)
				.where(eq(schema.projects.id, opts.input))
				.returning();

			if (!deleted_proj.length) {
				return {
					success: false,
					error: {
						code: 404,
						message: 'Project not found'
					}
				};
			}
			const project_id = deleted_proj[0].id;

			await deploymentManager.stopProject({ project_id });
			await sourceManager.deleteProject({ project_id });
		});

		return {
			success: true,
			data: void 0
		};
	});

export default deleteProject;
