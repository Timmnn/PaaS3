<script lang="ts">
	import { Label, Input, Button, Textarea } from 'flowbite-svelte';
	import { trpc } from '$lib/tRPCClient';

	let dockerComposeConfig = '';
	let projectName = 'Proj1';
	let exposedPort = 80;

	async function onSubmit(event: Event) {
		event.preventDefault();
		trpc.createProject.mutate({
			docker_compose_config: dockerComposeConfig,
			project_source: 'docker-compose',
			name: projectName,
			domain: 'localhost',
			build_command: 'docker-compose up -d',
			healthcheck_url: 'http://',
			description: 'Docker Compose Project',
			env_variables: [],
			exposed_port: exposedPort
		});
	}
</script>

<form on:submit={onSubmit}>
	<Label for="docker-compose-config">Docker Compose Config</Label>
	<Textarea
		id="docker-compose-config"
		size="md"
		placeholder="version: '3.3'"
		rows="20"
		bind:value={dockerComposeConfig}
	></Textarea>

	<Label for="project_name">Project Name</Label>
	<Input id="project_name" size="md" placeholder="Project Name" bind:value={projectName} />

	<Label for="exposed_port">Exposed Port</Label>
	<Input
		id="exposed_port"
		size="md"
		placeholder="Exposed Port"
		type="number"
		bind:value={exposedPort}
	/>

	<Button type="submit">Create Project</Button>
</form>
