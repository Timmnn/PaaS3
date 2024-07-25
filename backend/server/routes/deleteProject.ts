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

export default deleteProject;
