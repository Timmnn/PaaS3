import { z } from 'zod';
import { useDb } from '../../lib/useDB';
import { publicProcedure } from '../router';
import type { ApiResponse, ProjectWithHealth } from '../types';
import getProjectHealthFunction from '../../lib/getProjectHealthFunction';
import * as schema from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import type { HealthcheckResponse } from '../types';

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

export default getProjectHealth;
