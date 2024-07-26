<script>
	import { Button } from 'flowbite-svelte';

	const project_sources = [
		{
			label: 'Public Git Repository',
			name: 'git',
			description: 'Clone a project from a public git repository'
		},
		{
			label: 'Docker Compose',
			name: 'docker-compose',
			description: 'Create a project from a docker-compose.yml file'
		},
		{
			label: 'Dockerfile',
			name: 'dockerfile',
			description: 'Create a project from a Dockerfile'
		}
	];
</script>

<h1>New Project</h1>

<div class="flex gap-3">
	{#each project_sources as source}
		<a href="/projects/new/{source.name}" class="flex-1">
			<div class="rounded-lg p-3 shadow-sm outline outline-1 outline-gray-500 hover:outline-4">
				<h2 class="text-xl">{source.label}</h2>
				<p>{source.description}</p>
			</div>
		</a>
	{/each}
</div>
