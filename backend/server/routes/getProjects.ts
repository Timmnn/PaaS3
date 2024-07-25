import { useDb } from '../../lib/useDB';
import { publicProcedure } from '../router';
import type { ApiResponse, ProjectWithHealth } from '../types';
import getProjectHealthFunction from '../../lib/getProjectHealthFunction';
import * as schema from '../../drizzle/schema';

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

export default getProjects;
