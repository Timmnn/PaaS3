import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../backend/server/main";

export const trpc = createTRPCClient<AppRouter>({
   links: [
      httpBatchLink({
         url: `http://backend:3001/trpc`,
      }),
   ],
});
