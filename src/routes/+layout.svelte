<script lang="ts">
	import ProgressToast from '$lib/components/ProgressToast.svelte';
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import { Toasts } from '$lib/state/toasts.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<div class="fixed right-4 bottom-4 z-50 flex flex-col space-y-2">
	{#each Toasts.values as toast, index (toast.id)}
		<div class="toast-enter" class:toast-stack-bounce={index > 0} style="animation-delay: {index * 50}ms">
			<ProgressToast {toast} />
		</div>
	{/each}
</div>

<div class="flex h-svh w-full flex-row overflow-x-hidden overflow-y-hidden bg-zinc-50 dark:bg-zinc-950">
	<Sidebar />
	<main class="flex w-full flex-col overflow-auto scroll-smooth p-4 md:p-6">
		{@render children()}
	</main>
</div>
