import { drizzle } from "drizzle-orm/node-postgres";
import { connectToDb } from "../lib/connectToDb";

let _db = null as null | ReturnType<typeof drizzle>;
async function useDb(): Promise<ReturnType<typeof drizzle> | null> {
   if (_db) {
      return _db;
   }

   const maybeDb = await connectToDb();

   if (maybeDb instanceof Error) {
      console.error("Failed to connect to database:", maybeDb);
      return null;
   }

   _db = maybeDb.db;

   return _db;
}

export { useDb };
