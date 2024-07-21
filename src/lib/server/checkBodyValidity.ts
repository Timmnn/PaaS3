/** @type {import('./$types').RequestHandler} */
import pkg from 'json-schema-library';
const { Draft07 } = pkg;

export default function checkBodyValidity(body: any, body_schema: any) {
	console.log('body', body, 'body_schema', JSON.stringify(body_schema, null, 2));
	console.log(
		'Draft07(body_schema).validate(body)',
		new Draft07(body_schema).validate(body).length,
		new Draft07(body_schema).validate(body).length === 0
	);

	return new Draft07(body_schema).validate(body).length === 0;
}
