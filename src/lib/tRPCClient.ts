import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../backend/server/main';

export const trpc = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `http://localhost:9000/trpc`
		})
	]
});
