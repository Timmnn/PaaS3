/** @type {import('./$types').RequestHandler} */
import pkg from 'json-schema-library';
const { Draft07 } = pkg;

export default function checkBodyValidity(body: any, body_schema: any) {
	return new Draft07(body_schema).validate(body).length === 0;
}
