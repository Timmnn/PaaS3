import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../backend/server/main";
import { config } from "dotenv";

let HOST = "localhost";

try {
   config({
      path: "../../.env",
   });
   HOST = process.env.HOST || "localhost";
} catch (e) {}

// Is different in docker container ( there its the name of the service (backend))

export const trpc = createTRPCClient<AppRouter>({
   links: [
      httpBatchLink({
         url: `http://${HOST}:9000/trpc`,
      }),
   ],
});
