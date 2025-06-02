<script lang="ts">
	interface Props {
		timestamp: Date | string;
	}

	let { timestamp }: Props = $props();

	let dbTimestamp = $derived(timestamp instanceof Date ? timestamp : new Date(timestamp));

	function formatTimeAgo(date: Date): string {
		const elapsed = Date.now() - date.getTime();
		const seconds = Math.floor(elapsed / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
		const years = Math.floor(days / 365);

		if (years > 0) {
			return years === 1 ? '1 year ago' : `${years} years ago`;
		} else if (days > 7) {
			return date.toLocaleDateString();
		} else if (days > 0) {
			return days === 1 ? '1 day ago' : `${days} days ago`;
		} else if (hours > 0) {
			return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
		} else if (minutes > 0) {
			return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
		} else {
			return 'just now';
		}
	}

	let timeText = $derived(formatTimeAgo(dbTimestamp));
</script>

{timeText}
