import { notificationService } from '$lib/services/notification-service.svelte';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		console.log('SSE client connecting, initializing notification service...');
		await notificationService.connect();
		console.log('Notification service ready for streaming');
	} catch (error) {
		console.error('Failed to connect notification service:', error);
		return new Response('Service Unavailable', { status: 503 });
	}

	const stream = new ReadableStream({
		start(controller) {
			console.log('SSE client connected');
			const encoder = new TextEncoder();

			controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));

			const unsubscribe = notificationService.addListener((event) => {
				try {
					const data = JSON.stringify(event);
					controller.enqueue(encoder.encode(`data: ${data}\n\n`));
				} catch (error) {
					console.error('Error sending SSE event:', error);
				}
			});

			// Keep-alive ping every 30 seconds
			const pingInterval = setInterval(() => {
				try {
					controller.enqueue(encoder.encode('data: {"type":"ping"}\n\n'));
				} catch (_) {
					clearInterval(pingInterval);
				}
			}, 30000);

			// Cleanup when client disconnects
			return () => {
				console.log('SSE client disconnected');
				unsubscribe();
				clearInterval(pingInterval);
			};
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
