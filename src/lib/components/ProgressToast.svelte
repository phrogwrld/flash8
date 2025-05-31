<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Toasts } from '$lib/state/toasts.svelte';

	type Toast = {
		id: string;
		type: 'info' | 'success' | 'error' | 'progress';
		message?: string;
		fileName?: string;
		progress?: number;
		timeLeft?: number;
	};

	let { toast }: { toast: Toast } = $props();

	function dismiss() {
		Toasts.remove(toast.id);
	}

	function getTitle() {
		switch (toast.type) {
			case 'progress':
				return `Uploading ${toast.fileName}`;
			case 'success':
				return 'Upload Complete';
			case 'error':
				return 'Upload Failed';
			default:
				return 'Upload Status';
		}
	}

	function getProgressText() {
		if (toast.type === 'success') return '100% · Complete';
		if (toast.type === 'error') return 'Failed';

		const percent = toast.progress || 0;
		const timeText = toast.timeLeft ? ` · ${toast.timeLeft} seconds left` : '';
		return `${percent}%${timeText}`;
	}

	function getIcon() {
		switch (toast.type) {
			case 'success':
				return `<svg class="shrink-0 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>`;
			case 'error':
				return `<svg class="shrink-0 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`;
			default:
				return `<svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                    <path d="M12 12v9"></path>
                    <path d="m16 16-4-4-4 4"></path>
                </svg>`;
		}
	}

	function getProgressBarColor() {
		switch (toast.type) {
			case 'success':
				return 'bg-green-600';
			case 'error':
				return 'bg-red-600';
			default:
				return 'bg-blue-600';
		}
	}

	let progressPercent = $derived(toast.progress || 0);
</script>

<div
	class="relative max-w-xs rounded-xl border border-gray-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
	role="alert"
	tabindex="-1"
	in:fly={{ y: 200, duration: 500, delay: 50 }}
	out:fly={{ y: 100, duration: 300 }}
>
	<div class="flex gap-x-3 p-4">
		<div class="shrink-0">
			<!-- Icon -->
			<span
				class="m-1 inline-flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-200"
			>
				{@html getIcon()}
			</span>

			<!-- Close Button -->
			<button
				type="button"
				class="absolute end-3 top-3 inline-flex size-5 shrink-0 items-center justify-center rounded-lg text-gray-800 opacity-50 hover:opacity-100 focus:opacity-100 focus:outline-hidden dark:text-white"
				aria-label="Close"
				onclick={dismiss}
			>
				<span class="sr-only">Close</span>
				<svg
					class="size-4 shrink-0"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M18 6 6 18"></path>
					<path d="m6 6 12 12"></path>
				</svg>
			</button>
		</div>

		<div class="me-5 grow">
			<h3 class="text-sm font-medium text-gray-800 dark:text-white">
				{getTitle()}
			</h3>

			<!-- Progress -->
			<div class="mt-2 flex flex-col gap-x-3">
				<span class="mb-1.5 block text-xs text-gray-500 dark:text-neutral-400">
					{getProgressText()}
				</span>

				{#if toast.type !== 'error'}
					<div
						class="flex h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-700"
						role="progressbar"
						aria-valuenow={progressPercent}
						aria-valuemin="0"
						aria-valuemax="100"
					>
						<div
							class="flex flex-col justify-center overflow-hidden {getProgressBarColor()} text-center text-xs whitespace-nowrap text-white transition-all duration-300"
							style="width: {progressPercent}%"
						></div>
					</div>
				{/if}

				{#if toast.message}
					<p class="mt-1 text-xs text-gray-600 dark:text-neutral-300">
						{toast.message}
					</p>
				{/if}
			</div>
		</div>
	</div>
</div>
