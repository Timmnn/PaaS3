import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({
   path: "../../.env",
});

export default defineConfig({
   dialect: "postgresql",
   schema: "schema.ts",
   out: "./drizzle",
   dbCredentials: {
      host: "localhost",
      port: 5432,
      user: process.env.PRIVATE_POSTGRES_USER as string,
      password: process.env.PRIVATE_POSTGRES_PASSWORD as string,
      database: process.env.PRIVATE_POSTGRES_DB as string,
      ssl: false,
   },
});
