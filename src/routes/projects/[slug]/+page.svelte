<script lang="ts">
	import { trpc } from '$lib/tRPCClient.js';
	import { Button } from 'flowbite-svelte';
	export let data;

	async function redeploy() {}

	async function start() {
		trpc.startProject.mutate(data.project.id);
	}
</script>

<h1>Project: "{data.project.name}"</h1>

Description: {data.project.description}

Domain: <a href={'https://' + data.project.domain}>{data.project.domain}</a>

RUNNING: {data.project.health === 'running' ? 'YES' : 'NO'}

<div>
	<Button on:click={start}>Start</Button>
	<Button on:click={redeploy}>Redeploy</Button>
</div>
