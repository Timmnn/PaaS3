import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../backend/server/main';
import { config } from 'dotenv';

config({
	path: '../../../.env'
});

const origin = typeof window === 'undefined' ? 'http://localhost:3001' : '';

const pro = process.env;

console.log('pro', pro);

export const getTRPCClient = (origin?: string) => {
	if (!origin) {
		if (typeof window !== 'undefined') {
			origin = window.location.origin;
		}

		if (!origin) {
			throw new Error('origin is required');
		}
	}

	return createTRPCClient<AppRouter>({
		links: [
			httpBatchLink({
				url: `${origin}:9000/trpc`
			})
		]
	});
};
