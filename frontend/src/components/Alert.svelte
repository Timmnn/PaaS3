<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let open: boolean;
	export let alertProps: any = {};

	import { Button, Alert } from 'flowbite-svelte';
	import { InfoCircleSolid } from 'flowbite-svelte-icons';

	function hideAlert(e?: any) {
		if (e) {
			e.preventDefault();
		}
		dispatch('close');
	}
</script>

<div class="alert">
	<Alert border class={open ? '' : 'hidden'} on:close={hideAlert} dismissable {...alertProps}>
		<Button slot="close-button" size="xs" let:close on:click={hideAlert} class="ms-auto"
			>Dissmiss</Button
		>

		<InfoCircleSolid slot="icon" class="h-5 w-5" />

		<slot>
			<p>Default alert message</p>
		</slot>
	</Alert>
</div>

<style>
	.hidden {
		display: none;
	}

	.alert {
		position: absolute;
		top: 1rem;
		left: 50%;
		transform: translateX(-50%);
	}
</style>
