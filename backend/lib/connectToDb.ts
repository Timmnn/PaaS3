import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Client } = pg;
import * as schema from "../drizzle/schema";
import { AsyncSafeExecutor } from "./SafeExecutor";
import { config } from "dotenv";

config({
   path: "../.env",
});
const {
   PRIVATE_POSTGRES_USER,
   PRIVATE_POSTGRES_PASSWORD,
   PRIVATE_POSTGRES_DB,
   PRIVATE_POSTGRES_HOST,
   PRIVATE_POSTGRES_PORT,
} = process.env as Record<string, string>;

async function _connectToDb(): Promise<{
   db: ReturnType<typeof drizzle>;
   schema: typeof schema;
}> {
   console.log(PRIVATE_POSTGRES_USER, PRIVATE_POSTGRES_PASSWORD, PRIVATE_POSTGRES_DB, process.env);

   const client = new Client({
      host: PRIVATE_POSTGRES_HOST,
      port: parseInt(PRIVATE_POSTGRES_PORT),
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
