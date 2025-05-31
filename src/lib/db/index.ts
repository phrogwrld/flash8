import { nanoid } from 'nanoid';
import { Pool } from 'pg';
import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';
import { getConfig } from '$lib/config';

async function getPool(): Promise<Pool> {
	const instanceConnectionName = await getConfig('INSTANCE_CONNECTION_NAME');

	const connector = new Connector();
	const socketOpts = await connector.getOptions({
		instanceConnectionName,
		ipType: IpAddressTypes.PUBLIC
		// authType: 'IAM',           // if using IAM DB auth
	});

	const pool = new Pool({
		...socketOpts,
		user: await getConfig('DB_USER'),
		password: await getConfig('DB_PASSWORD'),
		database: await getConfig('DB_NAME'),
		max: 5
	});
	return pool;
}

export class VTTFileService {}

export const vttFiles = {
	async getAll() {
		const pool = await getPool();
		const result = await pool.query('SELECT * FROM vtt_files ORDER BY created_at DESC');
		return result.rows;
	},

	async getById(id: string) {
		const pool = await getPool();
		const result = await pool.query('SELECT * FROM vtt_files WHERE id = $1', [id]);
		return result.rows[0] || null;
	},

	async create(fileName: string) {
		const pool = await getPool();
		const id = nanoid();

		await pool.query('INSERT INTO vtt_files (id, name, status) VALUES ($1, $2, $3)', [id, fileName, 'processing']);

		return id;
	}
};
