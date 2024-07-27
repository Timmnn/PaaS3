<script lang="typescript">
	import { Button } from 'flowbite-svelte';
	export let data;
</script>

<svelte:head>
	<title>Projects</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<h1 class="">Projects</h1>
<div class="flex flex-col gap-3">
	{#each data.projects as project}
		<a href={`/projects/${project.id}`} class="flex flex-col gap-1">
			<div class="w-fit rounded-md p-2 outline outline-2 outline-gray-400">
				<h2>{project.name}</h2>
				<p>{project.description}</p>
				<p>Health: <span class={'healthc-circle ' + project.health}></span></p>
				<a href={'http://' + project.domain} target="_blank">{project.domain}</a>
			</div>
		</a>
	{/each}
	{#if data.projects.length === 0}
		<p>No projects found</p>
	{/if}

	<a href="/projects/new" class=""><Button>Create a new project</Button></a>
</div>

<style lang="scss">
	.healthc-circle {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		display: inline-block;
		&.running {
			background-color: green;
		}

		&.stopped {
			background-color: red;
		}
	}
</style>
