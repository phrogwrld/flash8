<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	type Props = {
		children?: Snippet;
		class?: string;
		open: boolean;
		title?: string;
	};

	let { children, class: className, open = $bindable(false), title = '' }: Props = $props();
</script>

{#if open}
	<div
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 200 }}
		class="bg-bg/80 fixed top-0 right-0 bottom-0 left-0 z-[99999] grid place-content-center backdrop-blur-xs"
	>
		<button
			class="absolute top-4 right-4 cursor-pointer rounded p-1 hover:outline"
			aria-label="close"
			onclick={() => (open = false)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
			>
		</button>

		{#if title}
			<p class="font-semibold">{title}</p>
		{/if}

		{@render children?.()}
	</div>
{/if}
