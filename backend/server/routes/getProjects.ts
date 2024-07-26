import { useDb } from '../../lib/useDB';
import { publicProcedure } from '../router';
import type { ApiResponse, ProjectWithHealth } from '../types';
import getProjectHealthFunction from '../../lib/getProjectHealthFunction';
import * as schema from '../../drizzle/schema';
import logger from '../../lib/Logging';

type GetProjectsResponse = ProjectWithHealth[];
const getProjects = publicProcedure.query(async (): ApiResponse<GetProjectsResponse> => {
	logger.info('getProjects', { meta: { route: 'getProjects' } });
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

	const healthchecks = projects.map(async (project) => {
		return await getProjectHealthFunction(project);
	});

	const healthchecksResolved = await Promise.all(healthchecks);

	const projects_with_health = projects.map((project) => ({
		...project,
		health: healthchecksResolved[project.id]
	}));

	logger.info('All Projects including health', { meta: { projects_with_health } });

	return {
		success: true,
		data: projects_with_health
	};
});

export default getProjects;
