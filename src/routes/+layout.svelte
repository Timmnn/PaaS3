<script>
	import '../app.css';
	import Sidebar from '../components/Sidebar.svelte';
</script>

<div class="app dark flex h-full items-stretch">
	<Sidebar />
	<main class="p- flex-grow bg-gray-700 p-3 text-white">
		<slot></slot>
	</main>
</div>

<style>
</style>
