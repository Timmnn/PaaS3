import { drizzle } from 'drizzle-orm/node-postgres';
import { connectToDb } from '../../src/lib/server/connectToDb';

let _db = null as null | ReturnType<typeof drizzle>;
async function useDb(): Promise<ReturnType<typeof drizzle> | null> {
	if (_db) {
		return _db;
	}

	const maybeDb = await connectToDb();

	if (maybeDb instanceof Error) {
		return null;
	}

	_db = maybeDb.db;

	return _db;
}

export { useDb };
