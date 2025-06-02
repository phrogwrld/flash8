<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { Toasts } from '$lib/state/toasts.svelte';

	type Toast = {
		id: string;
		type: 'uploading' | 'processing' | 'completed' | 'failed';
		message?: string;
		fileName?: string;
		progress?: number;
		duration?: number;
	};

	let { toast }: { toast: Toast } = $props();

	function dismiss() {
		Toasts.remove(toast.id);
	}

	let countdownWidth = $state(100);
	let countdownInterval: ReturnType<typeof setInterval> | null = null;

	$effect(() => {
		if (toast.type === 'completed' || toast.type === 'failed') {
			countdownWidth = 100;

			const duration = toast.type === 'completed' ? 4000 : 5000;
			const intervalTime = 50;
			const decrement = (100 / duration) * intervalTime;

			countdownInterval = setInterval(() => {
				countdownWidth -= decrement;
				if (countdownWidth <= 0) {
					if (countdownInterval) {
						clearInterval(countdownInterval);
					}
				}
			}, intervalTime);
		} else {
			if (countdownInterval) {
				clearInterval(countdownInterval);
				countdownInterval = null;
			}
		}

		return () => {
			if (countdownInterval) {
				clearInterval(countdownInterval);
			}
		};
	});

	function getStatusInfo() {
		switch (toast.type) {
			case 'uploading':
				return {
					text: `Uploading ${toast.fileName}`,
					showDots: true,
					bgClass: 'bg-white dark:bg-zinc-800',
					textClass: 'text-zinc-700 dark:text-zinc-300',
					borderClass: 'border-zinc-200 dark:border-zinc-700',
					progressClass: 'bg-blue-500'
				};
			case 'processing':
				return {
					text: `Processing ${toast.fileName}`,
					showDots: true,
					bgClass: 'bg-white dark:bg-zinc-800',
					textClass: 'text-zinc-700 dark:text-zinc-300',
					borderClass: 'border-zinc-200 dark:border-zinc-700',
					progressClass: 'bg-zinc-400'
				};
			case 'completed':
				return {
					text: `${toast.fileName} completed!`,
					showDots: false,
					bgClass: 'bg-white dark:bg-zinc-800',
					textClass: 'text-green-700 dark:text-green-300',
					borderClass: 'border-green-200 dark:border-green-700',
					progressClass: 'bg-green-500'
				};
			case 'failed':
				return {
					text: `${toast.fileName} failed`,
					showDots: false,
					bgClass: 'bg-white dark:bg-zinc-800',
					textClass: 'text-red-700 dark:text-red-300',
					borderClass: 'border-red-200 dark:border-red-700',
					progressClass: 'bg-red-500'
				};
		}
	}

	let statusInfo = $derived(getStatusInfo());
</script>

<div
	class="relative w-80 max-w-sm {statusInfo.bgClass} {statusInfo.borderClass} overflow-hidden rounded-2xl border shadow-lg"
	in:fly={{ x: 400, duration: 300, delay: 100 }}
	out:fade={{ duration: 200 }}
>
	<div class="flex items-center gap-3 p-4">
		<div class="flex-shrink-0">
			{#if toast.type === 'uploading'}
				<div class="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
			{:else if toast.type === 'processing'}
				<div class="h-2 w-2 animate-pulse rounded-full bg-zinc-400"></div>
			{:else if toast.type === 'completed'}
				<div class="h-2 w-2 rounded-full bg-green-500"></div>
			{:else if toast.type === 'failed'}
				<div class="h-2 w-2 rounded-full bg-red-500"></div>
			{/if}
		</div>

		<div class="min-w-0 flex-1">
			<p class="text-sm font-medium {statusInfo.textClass} truncate">
				{statusInfo.text}
				{#if statusInfo.showDots}
					<span class="inline-flex">
						<span class="animate-pulse" style="animation-delay: 0s">.</span>
						<span class="animate-pulse" style="animation-delay: 0.2s">.</span>
						<span class="animate-pulse" style="animation-delay: 0.4s">.</span>
					</span>
				{/if}
			</p>
		</div>

		<button
			type="button"
			class="flex-shrink-0 rounded-md p-1 opacity-60 transition-colors hover:bg-zinc-100 hover:opacity-100 dark:hover:bg-zinc-700"
			onclick={dismiss}
			aria-label="Close notification"
		>
			<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>

	{#if toast.type === 'uploading' && typeof toast.progress === 'number'}
		<div class="px-4 pb-3">
			<div class="h-0.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
				<div
					class="h-0.5 rounded-full {statusInfo.progressClass} transition-all duration-300"
					style="width: {toast.progress}%"
				></div>
			</div>
		</div>
	{/if}

	{#if (toast.type === 'completed' || toast.type === 'failed') && countdownWidth > 0}
		<div class="absolute bottom-0 left-0 h-0.5 w-full bg-zinc-200 dark:bg-zinc-700">
			<div
				class="h-full {statusInfo.progressClass} transition-all duration-75 ease-linear"
				style="width: {countdownWidth}%"
			></div>
		</div>
	{/if}
</div>
