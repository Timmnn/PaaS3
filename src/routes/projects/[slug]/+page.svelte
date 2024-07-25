<script lang="ts">
	import { trpc } from '$lib/tRPCClient.js';
	import { Button, ButtonGroup, Modal } from 'flowbite-svelte';
	import Alert from '../../../components/Alert.svelte';
	import {
		ReplySolid,
		PlaySolid,
		TrashBinSolid,
		ExclamationCircleOutline
	} from 'flowbite-svelte-icons';

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

	function deleteProject() {
		trpc.deleteProject.mutate(data.project.id).then((res) => {
			if (!res.success) {
				console.error(res.error);
				return;
			}

			window.location.href = '/projects';
		});
	}

	let deleteProjectModalOpen = false;
</script>

<h1>Project: "{data.project.name}"</h1>

Description: {data.project.description}

Domain: <a href={'https://' + data.project.domain}>{data.project.domain}</a>

RUNNING: {data.project.health === 'running' ? 'YES' : 'NO'}

<div>
	<Modal bind:open={deleteProjectModalOpen} size="xs" autoclose>
		<div class="text-center">
			<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
			<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
				Are you sure you want to delete this project?
				<br />
				This action cannot be undone.
			</h3>
			<Button color="red" class="me-2">Yes, I'm sure</Button>
			<Button color="alternative" on:click={deleteProject}>No, cancel</Button>
		</div>
	</Modal>

	<Alert
		open={visible_alert === 'project_started'}
		on:close={hideAlert}
		alertProps={{ border: true, color: 'green' }}>Project Started</Alert
	>
	<Alert open={visible_alert === 'project_failed_to_start'} on:close={hideAlert}
		>Failed to start project</Alert
	>
	<ButtonGroup class="*:!ring-primary-700">
		<Button on:click={start} color="dark" size="xl">
			<PlaySolid class="me-2 h-4 w-4" />
			Start</Button
		>
		<Button on:click={redeploy} color="dark">
			<ReplySolid class="me-2 h-4 w-4" />
			Redeploy</Button
		>
		<Button color="dark" on:click={() => (deleteProjectModalOpen = true)}>
			<TrashBinSolid class="me-2 h-4 w-4" />
			Delete
		</Button>
	</ButtonGroup>
</div>
