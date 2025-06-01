<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary';

	type BaseProps = {
		children?: Snippet;
		class?: string;
		href?: string;
		loading?: boolean;
		disabled?: boolean;
		variant?: Variant;
	};

	type AnchorProps = HTMLAnchorAttributes & BaseProps;
	type ButtonProps = HTMLButtonAttributes & BaseProps;

	type Props<T extends AnchorProps> = T['href'] extends '' | undefined ? ButtonProps : AnchorProps;

	let {
		children,
		class: className = '',
		href,
		loading = false,
		disabled = false,
		variant = 'primary',
		...props
	}: Props<AnchorProps> = $props();

	const isDisabled = disabled || loading;
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	class={twMerge(
		'relative rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-colors duration-150 hover:bg-zinc-200 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-500 dark:focus:ring-offset-zinc-800',

		// Variants

		variant === 'primary' &&
			'bg-zinc-700 text-white hover:bg-zinc-600 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600',
		variant === 'secondary' &&
			'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-500',
		className
	)}
	disabled={isDisabled}
	{href}
	tabindex={isDisabled ? -1 : undefined}
	aria-disabled={isDisabled ? 'true' : 'false'}
	role={href ? 'link' : 'button'}
	{...props}
>
	{#if loading}{@render IconSpinner()}{/if}

	{@render children?.()}
</svelte:element>

{#snippet IconSpinner()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class="text-primary absolute right-1/2 bottom-1/2 size-4 translate-x-1/2 translate-y-1/2 animate-spin"
		viewBox="0 0 16 16"
	>
		<path
			fill="currentColor"
			d="M8 0A8 8 0 0 0 .002 7.812C.094 4.033 2.968 1 6.5 1C10.09 1 13 4.134 13 8a1.5 1.5 0 0 0 3 0a8 8 0 0 0-8-8m0 16a8 8 0 0 0 7.998-7.812C15.906 11.967 13.032 15 9.5 15C5.91 15 3 11.866 3 8a1.5 1.5 0 0 0-3 0a8 8 0 0 0 8 8"
		/>
	</svg>
{/snippet}
