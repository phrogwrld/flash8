import type { Process } from '$lib/schema';

class ProcessUpdatesStore {
	private eventSource: EventSource | null = null;
	private listeners = new Set<(process: Process) => void>();

	connect(): void {
		if (this.eventSource) return;

		this.eventSource = new EventSource('/api/stream');

		this.eventSource.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);

				if (data.type === 'process_update' && data.data) {
					this.listeners.forEach((listener) => listener(data.data));
				}
			} catch (error) {
				console.error('Error parsing SSE message:', error);
			}
		};

		this.eventSource.onerror = (error) => {
			console.error('SSE connection error:', error);
		};

		this.eventSource.onopen = () => {
			console.log('SSE connection opened');
		};
	}

	disconnect(): void {
		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
		}
	}

	onProcessUpdate(callback: (process: Process) => void): () => void {
		this.listeners.add(callback);
		return () => this.listeners.delete(callback);
	}
}

export const processUpdatesStore = new ProcessUpdatesStore();
