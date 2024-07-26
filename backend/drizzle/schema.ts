import { integer, pgEnum, pgTable, serial, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import type { PgTable } from 'drizzle-orm/pg-core';

const ProjectSources = ['public-git', 'docker-compose', 'dockerfile'] as const;
export const project_sources = pgEnum('project_sources', ProjectSources);
export type project_sources = (typeof ProjectSources)[number];
const HealthcheckTypes = ['http', 'command'] as const;
export const healthcheck_type = pgEnum('healthcheck_type', HealthcheckTypes);

export const projects = pgTable('projects', {
	id: serial('id').primaryKey(),
	name: varchar('name').notNull().unique(),
	docker_compose_config: varchar('docker_compose_config'),
	domain: varchar('domain').notNull(),
	description: varchar('description').notNull().default(''),
	project_source: project_sources('project_source').notNull(),
	git_repo_url: varchar('git_repo_url').notNull().default(''),
	build_command: varchar('build_command'),
	healthcheck_url: varchar('healthcheck_url').notNull(),
	docker_compose_config_location: varchar('docker_compose_config_location'),
	dockerfile_content: varchar('dockerfile_content'),
	exposed_port: integer('exposed_port').notNull()
});

export const project_env_variables = pgTable('project_env_variables', {
	key: varchar('key').notNull(),
	value: varchar('value').notNull(),
	project_id: integer('project_id').references(() => projects.id),
	id: serial('id').primaryKey()
});

export const deployments = pgTable('deployments', {
	id: serial('id').primaryKey(),
	project_id: integer('project_id').references(() => projects.id),
	name: varchar('name')
});

export const deployments_domains = pgTable('deployments_domains', {
	id: serial('id').primaryKey(),
	deployment_id: integer('deployment_id').references(() => deployments.id),
	domain: varchar('domain').notNull()
});

export const deployments_ports = pgTable('deployments_ports', {
	id: serial('id').primaryKey(),
	deployment_id: integer('deployment_id').references(() => deployments.id),
	port: integer('port').notNull()
});
