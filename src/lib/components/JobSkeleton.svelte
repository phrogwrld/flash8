<script lang="ts">
	interface Props {
		count?: number;
	}

	let { count = 5 }: Props = $props();
</script>

<div class="space-y-3">
	{#each Array(count) as _}
		<div
			class="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-700/50"
		>
			<div class="flex items-center space-x-4">
				<div class="flex-shrink-0">
					<div class="h-8 w-8 animate-pulse rounded bg-zinc-300 dark:bg-zinc-600"></div>
				</div>
				<div class="min-w-0 flex-1">
					<div class="flex items-center space-x-2">
						<div class="h-5 w-48 animate-pulse rounded bg-zinc-300 dark:bg-zinc-600"></div>
						<div class="h-6 w-20 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-600"></div>
					</div>
					<div class="mt-2 h-3 w-32 animate-pulse rounded bg-zinc-300 dark:bg-zinc-600"></div>
				</div>
			</div>
			<div class="flex items-center space-x-2">
				<div class="h-8 w-20 animate-pulse rounded bg-zinc-300 dark:bg-zinc-600"></div>
				<div class="h-8 w-16 animate-pulse rounded bg-zinc-300 dark:bg-zinc-600"></div>
			</div>
		</div>
	{/each}
</div>
