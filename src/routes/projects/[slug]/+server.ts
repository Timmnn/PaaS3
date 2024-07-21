import { connectToDb } from '$lib/server/connectToDb.js';
import { error } from '@sveltejs/kit';
import checkBodyValidity from '$lib/server/checkBodyValidity';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request }: { request: Request }) {
	const body = await request.json();

	const body_schema = {
		$ref: '#/definitions/TYPENAME',
		$schema: 'http://json-schema.org/draft-07/schema#',
		definitions: {
			TYPENAME: {
				additionalProperties: false,
				properties: {
					projectId: {
						type: 'number'
					}
				},
				required: ['projectId'],
				type: 'object'
			}
		}
	};

	if (!checkBodyValidity(body, body_schema)) {
		return error(400, {
			message: 'Invalid body'
		});
	}

	const maybeDb = await connectToDb();

	if (maybeDb instanceof Error) {
		return error(500, {
			message: 'Failed to connect to database'
		});
	}

	const { db, schema } = maybeDb;

	const projects = await db
		.select()
		.from(schema.projects)
		.where(eq(schema.projects.id, body.projectId));

	if (!projects.length) {
		return error(404, {
			message: 'Project not found'
		});
	}

	const project = projects[0];

	return {
		body: {
			project
		}
	};
}
