<script lang="ts">
	import { Button } from 'flowbite-svelte';
	export let data;

	async function redeploy() {
		fetch(`/api/projects/${data.project.id}/redeploy`, {
			method: 'POST'
		});
	}
</script>

{JSON.stringify(data)}
<h1>Project: "{data.project.name}"</h1>

Description: {data.project.description}

Domain: <a href={'https://' + data.project.domain}>{data.project.domain}</a>

<div>
	<Button on:click={redeploy}>Redeploy</Button>
</div>

Healthcheck: {data.project.healthcheck}
