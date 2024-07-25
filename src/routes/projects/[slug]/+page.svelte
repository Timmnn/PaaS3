<script lang="ts">
	import { trpc } from '$lib/tRPCClient.js';
	import { Button } from 'flowbite-svelte';
	import Alert from '../../../components/Alert.svelte';
	import { InfoCircleSolid } from 'flowbite-svelte-icons';

	export let data;

	async function redeploy() {}

	async function start() {
		trpc.startProject.mutate(data.project.id).then((res) => {
			if (!res.success) {
				console.error(res.error);
				showAlert('project_failed_to_start');
				return;
			}

			showAlert('project_started');
		});
	}

	let visible_alert = '';

	function showAlert(alert_name: string) {
		visible_alert = alert_name;
		setTimeout(() => {
			//hideAlert();
		}, 3000);
	}

	function hideAlert(e?: any) {
		if (e) {
			e.preventDefault();
		}
		visible_alert = '';
	}
</script>

<h1>Project: "{data.project.name}"</h1>

Description: {data.project.description}

Domain: <a href={'https://' + data.project.domain}>{data.project.domain}</a>

RUNNING: {data.project.health === 'running' ? 'YES' : 'NO'}

<div>
	<Alert
		open={visible_alert === 'project_started'}
		on:close={hideAlert}
		alertProps={{ border: true, color: 'green' }}>Project Started</Alert
	>
	<Alert open={visible_alert === 'project_failed_to_start'} on:close={hideAlert}
		>Failed to start project</Alert
	>
	<Button on:click={start}>Start</Button>
	<Button on:click={redeploy}>Redeploy</Button>
</div>
