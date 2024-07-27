import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Client } = pg;
import * as schema from "../drizzle/schema";
import { AsyncSafeExecutor } from "./SafeExecutor";
import { config } from "dotenv";

config({
   path: "../../../.env",
});
const { PRIVATE_POSTGRES_USER, PRIVATE_POSTGRES_PASSWORD, PRIVATE_POSTGRES_DB } = process.env;

async function _connectToDb(): Promise<{
   db: ReturnType<typeof drizzle>;
   schema: typeof schema;
}> {
   const client = new Client({
      host: "localhost",
      port: 5432,
      user: PRIVATE_POSTGRES_USER,
      password: PRIVATE_POSTGRES_PASSWORD,
      database: PRIVATE_POSTGRES_DB,
   });

   await client.connect();
   // initialize the database with the schema
   const db = drizzle(client, {
      schema,
   });

   return {
      db,
      schema,
   };
}

export const connectToDb = AsyncSafeExecutor(_connectToDb);
