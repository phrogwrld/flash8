import { nanoid } from 'nanoid';
import { Pool } from 'pg';
import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';

const connector = new Connector();
const clientOpts = await connector.getOptions({
	instanceConnectionName: 'flash8-sandbox:us-central1:flash8-postgres',
	ipType: IpAddressTypes.PUBLIC
});
const pool = new Pool({
	...clientOpts,
	user: 'postgres',
	password: 'password',
	database: 'postgres',
	max: 5
});

export class VTTFileService {}

export const vttFiles = {
	async getAll() {
		const result = await pool.query('SELECT * FROM vtt_files ORDER BY created_at DESC');

		return result.rows;
	},

	async getById(id: string) {
		const result = await pool.query('SELECT * FROM vtt_files WHERE id = $1', [id]);
		return result.rows[0] || null;
	},

	async create(fileName: string) {
		const id = nanoid();

		await pool.query('INSERT INTO vtt_files (id, name, status) VALUES ($1, $2, $3)', [id, fileName, 'processing']);

		return id;
	}
};
