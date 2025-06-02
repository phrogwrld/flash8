import { nanoid } from 'nanoid';
import { Pool, type PoolClient } from 'pg';
import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';
import { getConfig } from '$lib/config';
import type { Process, ProcessStatus } from '$lib/schema';

async function getPool(): Promise<Pool> {
	const instanceConnectionName = getConfig('INSTANCE_CONNECTION_NAME');

	const connector = new Connector();
	const socketOpts = await connector.getOptions({
		instanceConnectionName,
		ipType: IpAddressTypes.PUBLIC
		// authType: 'IAM',           // if using IAM DB auth
	});

	const pool = new Pool({
		...socketOpts,
		user: getConfig('DB_USER'),
		password: getConfig('DB_PASSWORD'),
		database: getConfig('DB_NAME'),
		max: 5
	});
	return pool;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
	const pool = await getPool();
	let client: PoolClient | null = null;

	try {
		client = await pool.connect();
		const result = await client.query(query, params);
		return result.rows;
	} catch (error) {
		console.error('Database query error:', error);
		throw error;
	} finally {
		if (client) {
			client.release();
		}
	}
}

export class ProcessService {
	async getAll(): Promise<Process[]> {
		const query = `
			SELECT 
				id, 
				name, 
				status, 
				outputs, 
				original_file_name, 
				original_file_path, 
				original_file_size, 
				created_at, 
				updated_at 
			FROM processes 
			ORDER BY created_at DESC
		`;
		return executeQuery<Process>(query);
	}

	async getById(id: string): Promise<Process | null> {
		const query = `
			SELECT 
				id, 
				name, 
				status, 
				outputs, 
				original_file_name, 
				original_file_path, 
				original_file_size, 
				created_at, 
				updated_at 
			FROM processes 
			WHERE id = $1
		`;
		const results = await executeQuery<Process>(query, [id]);
		return results[0] || null;
	}

	async create(
		fileName: string,
		originalFileName?: string,
		originalFilePath?: string,
		originalFileSize?: number
	): Promise<string> {
		const id = nanoid();
		const query = `
			INSERT INTO processes (
				id, 
				name, 
				status,
				original_file_name,
				original_file_path,
				original_file_size,
				created_at,
				updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
			RETURNING id
		`;

		const params = [
			id,
			fileName,
			'processing' as ProcessStatus,
			originalFileName || null,
			originalFilePath || null,
			originalFileSize || null
		];

		await executeQuery(query, params);
		return id;
	}

	async updateFileMetadata(
		id: string,
		metadata: {
			originalFileName?: string;
			originalFilePath?: string;
			originalFileSize?: number;
		}
	): Promise<Process | null> {
		const query = `
			UPDATE processes 
			SET 
				original_file_name = COALESCE($1, original_file_name),
				original_file_path = COALESCE($2, original_file_path),
				original_file_size = COALESCE($3, original_file_size),
				updated_at = NOW()
			WHERE id = $4
			RETURNING 
				id, 
				name, 
				status, 
				outputs, 
				original_file_name, 
				original_file_path, 
				original_file_size, 
				created_at, 
				updated_at
		`;

		const results = await executeQuery<Process>(query, [
			metadata.originalFileName || null,
			metadata.originalFilePath || null,
			metadata.originalFileSize || null,
			id
		]);

		return results[0] || null;
	}

	async updateStatus(id: string, status: ProcessStatus, outputs?: string): Promise<Process | null> {
		const query = `
			UPDATE processes 
			SET 
				status = $1,
				outputs = COALESCE($2, outputs),
				updated_at = NOW()
			WHERE id = $3
			RETURNING 
				id, 
				name, 
				status, 
				outputs, 
				original_file_name, 
				original_file_path, 
				original_file_size, 
				created_at, 
				updated_at
		`;

		const results = await executeQuery<Process>(query, [status, outputs || null, id]);

		const updatedProcess = results[0] || null;

		if (updatedProcess) {
			console.log(`Updated process ${id} to status: ${status}`);
		}

		return updatedProcess;
	}
}

export const processService = new ProcessService();
