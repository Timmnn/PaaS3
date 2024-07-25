import { z } from 'zod';
import { useDb } from '../../lib/useDB';
import { publicProcedure } from '../router';
import type { ApiResponse, ProjectWithHealth } from '../types';
import getProjectHealthFunction from '../../lib/getProjectHealthFunction';
import * as schema from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

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

export default getProject;
