<script lang="ts">
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import JobSkeleton from '$lib/components/JobSkeleton.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import TimeAgo from '$lib/components/TimeAgo.svelte';
	import { FileUploadSchema, type Process } from '$lib/schema';
	import { Toasts } from '$lib/state/toasts.svelte';
	import { processUpdatesStore } from '$lib/stores/process-realtime.svelte';
	import { onDestroy, onMount } from 'svelte';

	let processes: Process[] = $state([]);
	let isLoading = $state(true);
	let error = $state('');

	let showUploadModal = $state(false);
	let uploadName = $state('');
	let file: File | null = $state(null);
	let isUploading = $state(false);
	let uploadMessage = $state('');

	const statusMap = {
		completed: 'success',
		processing: 'processing',
		failed: 'failed'
	} as const;

	const getStatusVariant = (status: string) => statusMap[status.toLowerCase() as keyof typeof statusMap] ?? 'disabled';

	async function loadProcesses() {
		try {
			isLoading = true;
			error = '';
			const response = await fetch('/api/files');

			if (!response.ok) {
				throw new Error('Failed to load processes');
			}

			processes = await response.json();
			isLoading = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load processes';
			console.error('Error loading processes:', err);
		}
	}

	function updateProcess(updatedProcess: Process) {
		const index = processes.findIndex((p) => p.id === updatedProcess.id);
		if (index !== -1) {
			processes[index] = updatedProcess;
			console.log(`Process ${updatedProcess.id} updated to: ${updatedProcess.status}`);

			// Show toast when process completes
			if (updatedProcess.status === 'completed') {
				Toasts.add({
					type: 'completed',
					fileName: updatedProcess.name,
					message: `${updatedProcess.name} is ready for download!`
				});
			} else if (updatedProcess.status === 'failed') {
				Toasts.add({
					type: 'failed',
					fileName: updatedProcess.name,
					message: `Processing of ${updatedProcess.name} failed. Please try again.`
				});
			}
		}
	}

	async function upload() {
		uploadMessage = '';

		const validatedData = FileUploadSchema.safeParse({
			name: uploadName || undefined,
			file: file
		});

		if (!validatedData.success) {
			const firstError = validatedData.error.issues[0];
			uploadMessage = firstError?.message || 'Please check your input';
			return;
		}

		try {
			Toasts.add({
				type: 'uploading',
				fileName: validatedData.data.file.name,
				message: `Uploading ${validatedData.data.file.name}`
			});

			isUploading = true;
			const formData = new FormData();

			formData.append('file', validatedData.data.file);

			if (validatedData.data.name) {
				formData.append('name', validatedData.data.name);
			}

			const response = await fetch('/api/files', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errorText = await response.text();
				uploadMessage = errorText || 'Upload failed';
				throw new Error(errorText || 'Upload failed');
			}

			const result = await response.json();
			console.log('Upload successful:', result);

			isUploading = false;
			uploadMessage = 'File uploaded successfully!';

			file = null;
			uploadName = '';

			const fileInputElement = document.getElementById('vtt-file-input') as HTMLInputElement;
			if (fileInputElement) {
				fileInputElement.value = '';
			}

			Toasts.add({
				type: 'processing',
				fileName: validatedData.data.name
			});

			// Refresh the files list
			await loadProcesses();

			// Close modal after a brief delay to show success message
			setTimeout(() => {
				showUploadModal = false;
				uploadMessage = '';
			}, 1500);
		} catch (err) {
			console.error('Upload error:', err);
			if (!uploadMessage) {
				uploadMessage = 'Upload failed. Please try again.';
			}
			Toasts.add({
				type: 'failed',
				fileName: uploadName || 'Unknown file',
				message: uploadMessage || 'Upload failed. Please try again.'
			});
		}
	}

	function closeModal() {
		showUploadModal = false;
		file = null;
		uploadMessage = '';
		const fileInputElement = document.getElementById('vtt-file-input') as HTMLInputElement;
		if (fileInputElement) {
			fileInputElement.value = '';
		}
	}

	let unsubscribe: (() => void) | null = null;

	onMount(() => {
		loadProcesses();

		processUpdatesStore.connect();
		unsubscribe = processUpdatesStore.onProcessUpdate(updateProcess);
	});

	onDestroy(() => {
		unsubscribe?.();
		processUpdatesStore.disconnect();
	});
</script>

<div class="mx-auto w-full space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Upload History</h1>
		<div class="flex items-center space-x-3">
			<Button class="px-4 py-2 text-sm font-semibold" variant="secondary" onclick={loadProcesses} loading={isLoading}
				>{isLoading ? 'Refreshing...' : 'Refresh'}</Button
			>
			<Button class="px-4 py-2 text-sm font-semibold" onclick={() => (showUploadModal = true)}>Upload</Button>
		</div>
	</div>

	<div
		class="rounded-lg border border-zinc-300 bg-white p-4 shadow-lg md:p-6 lg:p-8 dark:border-zinc-700 dark:bg-zinc-800"
	>
		<div class="space-y-6">
			{#if error}
				<div
					class="rounded-md border border-red-400 bg-red-100 p-3 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/40 dark:text-red-300"
				>
					<p>{error}</p>
				</div>
			{/if}

			{#if isLoading}
				<JobSkeleton />
			{:else if processes.length === 0}
				<div class="py-12 text-center">
					<div class="mx-auto w-80 max-w-md">
						<div class="relative">
							<div
								class="absolute top-6 right-4 left-4 flex items-center justify-between rounded-xl border border-zinc-200/60 bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/60"
							>
								<div class="flex items-center space-x-3">
									<div class="h-8 w-8 rounded bg-zinc-200/80 dark:bg-zinc-700/80"></div>
									<div class="space-y-1">
										<div class="h-3 w-16 rounded bg-zinc-200/80 dark:bg-zinc-600/80"></div>
										<div class="h-2 w-12 rounded bg-zinc-200/80 dark:bg-zinc-600/80"></div>
									</div>
								</div>
								<div class="flex space-x-1">
									<div class="h-3 w-8 rounded bg-zinc-200/80 dark:bg-zinc-600/80"></div>
									<div class="h-3 w-6 rounded bg-zinc-200/80 dark:bg-zinc-600/80"></div>
								</div>
							</div>
							<div
								class="absolute top-3 right-2 left-2 flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white/80 p-4 shadow-md backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-800/80"
							>
								<div class="flex items-center space-x-3">
									<div class="h-8 w-8 rounded bg-zinc-200/90 dark:bg-zinc-700/90"></div>
									<div class="space-y-1">
										<div class="h-3 w-20 rounded bg-zinc-200/90 dark:bg-zinc-600/90"></div>
										<div class="h-2 w-14 rounded bg-zinc-200/90 dark:bg-zinc-600/90"></div>
									</div>
								</div>
								<div class="flex space-x-1">
									<div class="h-3 w-8 rounded bg-zinc-200/90 dark:bg-zinc-600/90"></div>
									<div class="h-3 w-6 rounded bg-zinc-200/90 dark:bg-zinc-600/90"></div>
								</div>
							</div>
							<div
								class="relative z-10 flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
							>
								<div class="flex items-center space-x-3">
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
									<div class="space-y-1">
										<div class="h-3 w-24 animate-pulse rounded bg-zinc-300 dark:bg-zinc-600"></div>
										<div class="h-2 w-16 animate-pulse rounded bg-zinc-300 dark:bg-zinc-600"></div>
									</div>
								</div>
								<div class="flex space-x-1">
									<div class="h-3 w-8 animate-pulse rounded bg-zinc-300 dark:bg-zinc-600"></div>
									<div class="h-3 w-6 animate-pulse rounded bg-zinc-300 dark:bg-zinc-600"></div>
								</div>
							</div>
							<div class="h-12"></div>
						</div>
					</div>

					<div class="mt-2 space-y-2">
						<h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No files uploaded yet</h3>
						<p class="text-sm text-zinc-500 dark:text-zinc-400">
							Upload your first VTT file to get started with processing
						</p>
					</div>
					<Button
						class="mt-4 inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm"
						onclick={() => (showUploadModal = true)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="size-4"
							><path d="M12 13v8" /><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path
								d="m8 17 4-4 4 4"
							/></svg
						>
						Upload your first file</Button
					>
				</div>
			{:else}
				<div class="space-y-3">
					{#each processes as process (process.id)}
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
											{process.name}
										</p>
										<Badge variant={getStatusVariant(process.status)}>
											{process.status}
										</Badge>
									</div>
									<div class="mt-1 flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
										<span>Created <TimeAgo timestamp={process.created_at} /></span>
									</div>
								</div>
							</div>

							<!-- Actions -->
							<div class="flex items-center space-x-2">
								{#if process.status.toLowerCase() === 'completed'}
									<Button variant="primary" href={`/api/files/${process.id}/download`} target="_blank" rel="noopener">
										Download
									</Button>
								{/if}
								<Button variant="secondary" onclick={() => console.log('View details for', process.id)}>Details</Button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Upload Modal -->
<Modal bind:open={showUploadModal} title="Create a new Process" overwriteClose={closeModal}>
	<div class="space-y-6">
		<div class="space-y-2">
			<label for="file-name-input" class="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
				Process Name
			</label>
			<input
				id="file-name-input"
				type="text"
				bind:value={uploadName}
				placeholder="Enter a name for your file"
				class="block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
				disabled={isUploading}
			/>
		</div>
		<div class="space-y-2">
			<label for="vtt-file-input" class="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
				Select File
			</label>
			<input
				id="vtt-file-input"
				type="file"
				accept=".vtt"
				class="block w-full cursor-pointer rounded-lg border border-zinc-300 text-sm text-zinc-700 shadow-sm file:mr-4 file:cursor-pointer file:rounded-l-lg file:border-0 file:bg-zinc-50 file:px-4 file:py-3 file:font-medium file:text-zinc-700 hover:file:bg-zinc-100 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:file:bg-zinc-700 dark:file:text-zinc-200 dark:hover:file:bg-zinc-600"
				onchange={(e) => {
					const currentTarget = e.currentTarget as HTMLInputElement;
					file = currentTarget.files?.[0] ?? null;
					uploadMessage = '';
				}}
				disabled={isUploading}
			/>

			{#if file && !isUploading}
				<div class="inline-flex gap-x-1.5 text-sm text-zinc-500 dark:text-zinc-400">
					<span>Selected file: </span>
					<strong class="block truncate font-medium text-zinc-700 dark:text-zinc-300">{file.name}</strong>
				</div>
			{:else}
				<p class="text-xs text-zinc-500 dark:text-zinc-400">Only .vtt files are supported</p>
			{/if}
		</div>

		{#if uploadMessage}
			<div role="status">
				<p>{uploadMessage}</p>
			</div>
		{/if}

		{#if isUploading}
			<div class="text-center text-sm text-zinc-600 dark:text-zinc-400">
				<div class="mb-2 flex justify-center">
					<svg
						class="h-6 w-6 animate-spin text-zinc-500 dark:text-zinc-400"
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
				<div>
					Uploading <strong class="font-medium text-zinc-700 dark:text-zinc-300">{file?.name}</strong>...
				</div>
			</div>
		{/if}

		<div class="flex space-x-3 pt-2">
			<Button variant="secondary" class="flex-1 px-4 py-2.5" onclick={closeModal} disabled={isUploading}>Cancel</Button>
			<!-- <Button class="flex-1 px-4 py-2.5" onclick={upload} disabled={isUploading || !file} loading={isUploading}
				>{isUploading ? 'Uploading...' : 'Upload'}</Button
			> -->
			<button
				class="flex-1 rounded-md bg-zinc-700 px-4 py-2.5 text-base font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-zinc-600 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-500 dark:focus:ring-offset-zinc-800 dark:disabled:bg-zinc-500"
				onclick={upload}
				disabled={isUploading || !file}
			>
				{isUploading ? 'Uploading...' : 'Upload'}
			</button>
		</div>
	</div>
</Modal>
