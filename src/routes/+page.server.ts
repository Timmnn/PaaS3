import { getTRPCClient } from '$lib/tRPCClient';

export async function load(event) {
	const trpc = getTRPCClient(event.url.origin);
	const response = await trpc.getProjects.query();

	console.log('a');
	if (!response.success) {
		console.log('a1', response.error);
		throw new Error(response.error.message);
	}
	console.log('b');

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

	console.log(projects);

	return {
		projects: projects_with_health
	};
}
