import { type InferSelectModel } from 'drizzle-orm';
import * as schema from '../drizzle/schema';

interface SuccessResponse<T> {
	success: true;
	data: T;
}

interface ErrorResponse {
	success: false;
	error: {
		code: number;
		message: string;
	};
}

type ApiResponse<T> = Promise<SuccessResponse<T> | ErrorResponse>;

type HealthcheckResponse = 'running' | 'stopped';

type ProjectWithHealth = InferSelectModel<typeof schema.projects> & {
	health: HealthcheckResponse;
};

export type { ApiResponse, ProjectWithHealth, SuccessResponse, ErrorResponse, HealthcheckResponse };
