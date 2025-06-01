<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		timestamp: Date | string;
	}

	let { timestamp }: Props = $props();

	let timeText = $state<string>('just now');
	let timer = $state<ReturnType<typeof setInterval> | null>(null);

	let dbTimestamp = $derived(timestamp instanceof Date ? timestamp : new Date(timestamp));

	function updateTime(): void {
		const elapsed = Date.now() - dbTimestamp.getTime();
		const seconds = Math.floor(elapsed / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
		const years = Math.floor(days / 365);

		if (years > 0) {
			timeText = years === 1 ? '1 year ago' : `${years} years ago`;
		} else if (days > 7) {
			timeText = dbTimestamp.toLocaleDateString();
		} else if (days > 0) {
			timeText = days === 1 ? '1 day ago' : `${days} days ago`;
		} else if (hours > 0) {
			timeText = hours === 1 ? '1 hour ago' : `${hours} hours ago`;
		} else if (minutes > 0) {
			timeText = minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
		} else {
			timeText = 'just now';
		}

		if (timer) clearInterval(timer);
		timer = setInterval(updateTime, 60000);
	}

	$effect(() => {
		if (dbTimestamp) {
			updateTime();
		}
	});

	onMount(() => {
		updateTime();
	});

	onDestroy(() => {
		if (timer) clearInterval(timer);
	});
</script>

{timeText}
