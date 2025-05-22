<script lang="ts">
	let file: File | null = $state(null);
	let isUploading = $state(false);
	let message = $state('');

	async function upload() {
		message = '';
		if (!file || file.type !== 'text/vtt') {
			message = 'Please select a valid .vtt file';
			return;
		}

		try {
			isUploading = true;

			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch('https://upload-vtt-subtitle-156260873753.us-central1.run.app', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errorText = await response.text();
				message = errorText || 'Upload failed';
				throw new Error(errorText || 'Upload failed');
			}

			const result = await response.json();
			console.log('Upload successful:', result);

			message = 'File uploaded successfully!';
			file = null;

			const fileInputElement = document.getElementById('vtt-file-input') as HTMLInputElement;
			if (fileInputElement) {
				fileInputElement.value = '';
			}
		} catch (err) {
			console.error('Upload error:', err);
		} finally {
			isUploading = false;
		}
	}
</script>

<div
	class="mx-auto mt-10 max-w-md space-y-6 rounded-lg border border-zinc-300 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
>
	<h1 class="text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Upload a .vtt File</h1>

	<div>
		<label for="vtt-file-input" class="sr-only">Upload .vtt file</label>
		<input
			id="vtt-file-input"
			type="file"
			accept=".vtt"
			class="block w-full cursor-pointer rounded-md border border-zinc-300 text-sm text-zinc-700 shadow-sm file:mr-4 file:cursor-pointer file:rounded-l-md
                   file:border-0 file:bg-zinc-100 file:px-4 file:py-2.5
                   file:font-semibold file:text-zinc-700 hover:file:bg-zinc-200
                   focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500
                   focus:outline-none dark:border-zinc-600 dark:bg-zinc-700
                   dark:text-zinc-300 dark:file:bg-zinc-600 dark:file:text-zinc-200 dark:hover:file:bg-zinc-500
                   dark:focus:ring-offset-zinc-800"
			onchange={(e) => {
				const currentTarget = e.currentTarget as HTMLInputElement;
				file = currentTarget.files?.[0] ?? null;
				message = '';
			}}
			disabled={isUploading}
		/>
	</div>

	{#if message}
		<div
			class="rounded-md border border-gray-400 bg-gray-100 p-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-300"
			role="status"
		>
			<p>{message}</p>
		</div>
	{/if}

	{#if file && !isUploading}
		<div class="text-sm text-zinc-500 dark:text-zinc-400">
			Selected file: <strong class="font-medium text-zinc-700 dark:text-zinc-300">{file.name}</strong>
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
			Uploading<strong class="font-medium text-zinc-700 dark:text-zinc-300">{file?.name}</strong>...
		</div>
	{/if}

	<div class="pt-2">
		<button
			class="w-full rounded-md bg-zinc-700 px-4 py-2.5 text-base font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-zinc-600 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-500 dark:focus:ring-offset-zinc-800 dark:disabled:bg-zinc-500"
			onclick={upload}
			disabled={isUploading || !file}
		>
			{isUploading ? 'Please wait...' : 'Upload'}
		</button>
	</div>
</div>
