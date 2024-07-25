import type { InferSelectModel } from 'drizzle-orm';
import type { HealthcheckResponse } from '../server/types';
import * as schema from '../drizzle/schema';

export default async function getProjectHealthFunction(
	project: InferSelectModel<typeof schema.projects>
): Promise<HealthcheckResponse> {
	const { domain, healthcheck_url } = project;
	return await fetch(`http://${domain}${healthcheck_url}`)
		.then((response) => {
			if (response.status === 200) {
				return 'running' as const;
			}

			return 'stopped' as const;
		})
		.catch(() => {
			return 'stopped' as const;
		});
}
