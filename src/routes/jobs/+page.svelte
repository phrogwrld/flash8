<script lang="ts">
	import { formatDate } from '$lib/utils';
	import { onMount } from 'svelte';

	interface VTTFile {
		id: string;
		name: string;
		status: string;
		outputs: string;
		created_at: string;
		updated_at: string;
	}

	let files: VTTFile[] = $state([]);
	let isLoading = $state(true);
	let error = $state('');

	function getStatusColor(status: string) {
		switch (status.toLowerCase()) {
			case 'completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
			case 'processing':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
			case 'failed':
				return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300';
		}
	}

	async function loadFiles() {
		try {
			isLoading = true;
			error = '';
			const response = await fetch('/api/files');

			if (!response.ok) {
				throw new Error('Failed to load files');
			}

			files = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load files';
		} finally {
			isLoading = false;
		}
	}

	async function downloadFile(fileId: string, fileName: string) {
		try {
			const response = await fetch(`/api/files/${fileId}/download`);

			if (!response.ok) {
				throw new Error('Download failed');
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (err) {
			console.error('Download error:', err);
			// You could show a toast notification here
		}
	}

	onMount(() => {
		loadFiles();
	});
</script>

<div
	class="mx-auto mt-10 max-w-4xl space-y-6 rounded-lg border border-zinc-300 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
>
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Upload History</h1>
		<button
			class="rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors duration-150 hover:bg-zinc-200 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:outline-none dark:bg-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-500 dark:focus:ring-offset-zinc-800"
			onclick={loadFiles}
			disabled={isLoading}
		>
			{isLoading ? 'Refreshing...' : 'Refresh'}
		</button>
	</div>

	{#if error}
		<div
			class="rounded-md border border-red-400 bg-red-100 p-3 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/40 dark:text-red-300"
		>
			<p>{error}</p>
		</div>
	{/if}

	{#if isLoading}
		<div class="flex justify-center py-8">
			<svg
				class="h-8 w-8 animate-spin text-zinc-500 dark:text-zinc-400"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
		</div>
	{:else if files.length === 0}
		<div class="py-12 text-center">
			<svg
				class="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<p class="mt-4 text-sm text-zinc-500 dark:text-zinc-400">No files uploaded yet</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each files as file}
				<div
					class="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition-colors duration-150 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-700/50 dark:hover:bg-zinc-700"
				>
					<div class="flex items-center space-x-4">
						<!-- Document Icon -->
						<div class="flex-shrink-0">
							<svg
								class="h-8 w-8 text-zinc-500 dark:text-zinc-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>

						<!-- File Info -->
						<div class="min-w-0 flex-1">
							<div class="flex items-center space-x-2">
								<p class="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
									{file.name}
								</p>
								<span class="inline-flex rounded-md px-2 py-1 text-xs font-medium {getStatusColor(file.status)}">
									{file.status}
								</span>
							</div>
							<p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
								Uploaded {formatDate(new Date(file.created_at))}
							</p>
						</div>
					</div>

					<!-- Actions -->
					<div class="flex items-center space-x-2">
						{#if file.status.toLowerCase() === 'completed'}
							<button
								class="rounded-md bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors duration-150 hover:bg-zinc-600 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:outline-none dark:bg-zinc-600 dark:hover:bg-zinc-500 dark:focus:ring-offset-zinc-800"
								onclick={() => downloadFile(file.id, file.name)}
							>
								Download
							</button>
						{/if}

						<button
							class="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-colors duration-150 hover:bg-zinc-200 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:outline-none dark:bg-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-500 dark:focus:ring-offset-zinc-800"
							onclick={() => console.log('View details for', file.id)}
						>
							Details
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
