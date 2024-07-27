import { trpc } from '$lib/tRPCClient';

export const load = async (event) => {
	const { params } = event;

	const project = await trpc.getProject.query(parseInt(params.slug));

	if (!project.success) {
		throw new Error(project.error.message);
	}

	return {
		project: project.data
	};
};
