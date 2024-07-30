import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../backend/server/main";
import { config } from "dotenv";

// Host is unavailabel in sveltekit server actions so it has to be set by .env
let HOST = "localhost:9000";

try {
   config({
      path: "../../.env",
   });
   console.log(process.env.API_HOST);
   HOST = process.env.API_HOST || "localhost:9000";
} catch (e) {}

// Is different in docker container ( there its the name of the service (backend))

export const trpc = createTRPCClient<AppRouter>({
   links: [
      httpBatchLink({
         url: `http://${HOST}/trpc`,
      }),
   ],
});
