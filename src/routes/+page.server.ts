import { trpc } from '$lib/tRPCClient';

export async function load(event) {
	const response = await trpc.getProjects.query();

	if (!response.success) throw new Error(response.error.message);

	const projects = response.data;
	const projects_with_health = projects as ((typeof projects)[0] & {
		health: 'running' | 'stopped';
	})[]; // add .health to each project

	for (const project of projects_with_health) {
		const healthcheck_response = await trpc.getProjectHealth.query(project.id);
		if (!healthcheck_response.success) {
			throw new Error(healthcheck_response.error.message);
		}

		project.health = healthcheck_response.data;
	}

	return {
		projects: projects_with_health
	};
}
