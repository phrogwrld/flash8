<script lang="ts">
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	type Variant = 'success' | 'processing' | 'disabled' | 'failed';

	type Props = {
		children: Snippet;
		class?: string;
		variant?: Variant;
	};

	let { children, class: className = '', variant = 'disabled' }: Props = $props();
</script>

<span
	class={twMerge(
		'inline-flex items-center gap-1 rounded-full border-[1.4px] px-2 py-1 align-middle text-xs font-semibold text-zinc-800 capitalize',
		variant === 'success' && 'border-green-100 bg-green-50',
		variant === 'processing' && 'border-[#e5e2fc] bg-[#fafaff]',
		variant === 'disabled' && 'border-gray-200 bg-gray-50',
		variant === 'failed' && 'border-rose-200 bg-red-50',
		className
	)}
>
	{#if variant === 'success'}
		<svg class="h-3 w-3 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
			<path
				d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM17.4571 9.45711L11 15.9142L6.79289 11.7071L8.20711 10.2929L11 13.0858L16.0429 8.04289L17.4571 9.45711Z"
			></path>
		</svg>
	{:else if variant === 'processing'}
		<svg class="h-3 w-3 animate-spin text-[#b0aafa]" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	{:else if variant === 'disabled'}
		<svg class="h-3 w-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
			></path>
		</svg>
	{:else if variant === 'failed'}
		<svg
			class="h-3 w-3 text-red-500/85"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			viewBox="0 0 24 24"
		>
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
			<path d="M12 9v4" />
			<path d="M12 17h.01" />
		</svg>
	{/if}
	{@render children?.()}
</span>
