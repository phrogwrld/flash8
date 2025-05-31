<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';

	type Props = {
		children?: Snippet;
		class?: string;
		open: boolean;
		title?: string;
		overwriteClose?: () => void;
	};

	let { children, class: className, open = $bindable(false), title = '', overwriteClose }: Props = $props();
</script>

{#if open}
	<div
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 200 }}
		class="bg-bg/80 fixed inset-0 z-[99999] grid place-content-center backdrop-blur-xs"
	>
		<div
			class={twMerge(
				'relative w-screen rounded-2xl bg-white shadow-xl sm:w-max sm:max-w-xl sm:min-w-96 dark:bg-zinc-900',
				className
			)}
		>
			<!-- Header -->
			<div class="relative flex items-center justify-between px-6 py-4">
				<div class="flex items-center space-x-3">
					{#if title}
						<p class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
					{/if}
				</div>
				<button
					class="rounded-lg p-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
					aria-label="close"
					onclick={() => {
						overwriteClose ? overwriteClose() : (open = false);
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="text-zinc-600 dark:text-zinc-300"
					>
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
				<!-- Border line with padding -->
				<div class="absolute inset-x-0 bottom-0 mx-6 h-px bg-zinc-200 dark:bg-zinc-700"></div>
			</div>

			<!-- Content -->
			<div class="p-6">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
