<script lang="ts">
	import { Label, Input, Button } from 'flowbite-svelte';
	import { trpc } from '$lib/tRPCClient';
	let gitRepoUrl = 'https://github.com/Timmnn/DockerComposeExample';
	let name = 'Project Name';
	let description = 'Project Description';
	let domain = 'example.com';
	let healthcheckUrl = '/healthcheck';

	let error = null as string | null;

	async function onSubmit(event: Event) {
		event.preventDefault();
		trpc.createProject.mutate({
			git_repo_url: gitRepoUrl,
			name,
			description,
			domain,
			project_source: 'public-git',
			healthcheck_url: healthcheckUrl,
			build_command: ''
		});
	}
</script>

<h1>New Git Project</h1>

<form class="flex flex-col gap-3" on:submit={onSubmit}>
	<Label for="git-repo-url">Git Repository Url</Label>
	<Input
		id="git-repo-url"
		size="md"
		placeholder="https://github.com/Timmnn/DockerComposeExample"
		bind:value={gitRepoUrl}
	/>

	<Label for="name">Name</Label>
	<Input id="name" size="md" placeholder="Docker Compose Example" bind:value={name} />

	<Label for="description">Description</Label>
	<Input
		id="description"
		size="md"
		placeholder="An example project using docker-compose"
		bind:value={description}
	/>

	<Label for="domain">Domain</Label>
	<Input id="domain" size="md" placeholder="docker-compose-example.com" bind:value={domain} />

	<Label for="healthcheck-url">Healthcheck Url</Label>
	<Input id="healthcheck-url" size="md" placeholder="/healthcheck" bind:value={healthcheckUrl} />

	<Button type="submit">Submit</Button>

	{#if error}
		<p class="text-red-500">{error}</p>
	{/if}
</form>
