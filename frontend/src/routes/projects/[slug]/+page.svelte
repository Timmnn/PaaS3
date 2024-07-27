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
				showAlert('Project could not be started', 'red');
				return;
			}
		});

		showAlert('Project started', 'green');
	}

	function showAlert(alert_message: string, alert_color: 'green' | 'red') {
		alert = {
			color: alert_color,
			message: alert_message,
			visible: true
		};
		setTimeout(() => {
			//hideAlert();
		}, 3000);
	}

	function hideAlert(e?: any) {
		if (e) {
			e.preventDefault();
		}

		alert.visible = false;
	}

	function deleteProject() {
		trpc.deleteProject.mutate(data.project.id).then((res) => {
			if (!res.success) {
				showAlert('Project could not be deleted', 'red');
				console.error(res.error);
				return;
			}

			showAlert('Project deleted', 'green');

			window.location.href = '/';
		});
	}

	let deleteProjectModalOpen = false;

	let alert = {
		color: 'green',
		message: '',
		visible: false
	} as {
		color: 'green' | 'red';
		message: string;
		visible: boolean;
	};

	function openSite() {
		window.open('http://' + data.project.domain, '_blank');
	}
</script>

<h1>Project: "{data.project.name}"</h1>

Description: {data.project.description}

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
			<Button color="red" class="me-2" on:click={deleteProject}>Yes, I'm sure</Button>
			<Button color="alternative">No, cancel</Button>
		</div>
	</Modal>

	<Alert
		open={alert.visible}
		on:close={hideAlert}
		alertProps={{ border: true, color: alert.color }}
	>
		{alert.message}
	</Alert>
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
		<Button color="dark" on:click={openSite}>Open site</Button>
	</ButtonGroup>
</div>
