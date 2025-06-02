import { getConfig } from '$lib/config';
import type { Process } from '$lib/schema';
import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';
import { Client } from 'pg';

export interface ProcessUpdateEvent {
	type: 'process_update';
	data: Process;
}

async function createNotificationClient(): Promise<Client> {
	const instanceConnectionName = getConfig('INSTANCE_CONNECTION_NAME');
	const connector = new Connector();
	const socketOpts = await connector.getOptions({
		instanceConnectionName,
		ipType: IpAddressTypes.PUBLIC
	});

	const client = new Client({
		...socketOpts,
		user: getConfig('DB_USER'),
		password: getConfig('DB_PASSWORD'),
		database: getConfig('DB_NAME')
	});

	return client;
}

class NotificationService {
	private client: Client | null = null;
	private listeners = new Set<(event: ProcessUpdateEvent) => void>();
	private isConnected = false;

	async connect(): Promise<void> {
		if (this.isConnected && this.client) return;

		try {
			console.log('Connecting to PostgreSQL for notifications...');

			this.client = await createNotificationClient();
			await this.client.connect();
			await this.client.query('LISTEN process_status_change');

			this.client.on('notification', (msg) => {
				try {
					if (msg.channel === 'process_status_change' && msg.payload) {
						const processData = JSON.parse(msg.payload) as Process;
						const event: ProcessUpdateEvent = {
							type: 'process_update',
							data: processData
						};

						console.log('Received process update:', processData.id, processData.status);

						this.listeners.forEach((listener) => {
							try {
								listener(event);
							} catch (error) {
								console.error('Error in notification listener:', error);
							}
						});
					}
				} catch (error) {
					console.error('Error parsing notification payload:', error);
				}
			});

			this.isConnected = true;
			console.log('Successfully connected to PostgreSQL notifications');
		} catch (error) {
			console.error('Failed to connect to PostgreSQL for notifications:', error);
			throw error;
		}
	}

	addListener(listener: (event: ProcessUpdateEvent) => void): () => void {
		this.listeners.add(listener);

		return () => {
			this.listeners.delete(listener);
		};
	}

	async disconnect(): Promise<void> {
		if (this.client) {
			try {
				await this.client.query('UNLISTEN process_status_change');
				await this.client.end();
			} catch (error) {
				console.error('Error disconnecting notification client:', error);
			} finally {
				this.client = null;
				this.isConnected = false;
			}
		}

		this.listeners.clear();
	}

	getConnectionStatus(): boolean {
		return this.isConnected;
	}
}

export const notificationService = new NotificationService();
