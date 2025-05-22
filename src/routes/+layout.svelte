<script lang="ts">
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<div class="flex h-svh w-full flex-row overflow-x-hidden overflow-y-hidden bg-zinc-50 dark:bg-zinc-950">
	<Sidebar />
	<main class="flex w-full flex-col overflow-auto scroll-smooth p-4 md:p-6">
		{@render children()}
	</main>
</div>
