import { nanoid } from 'nanoid';
import { Pool } from 'pg';
import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';
import { getConfig } from '$lib/config';

let pool: Pool | null = null;

async function getPool(): Promise<Pool> {
	const instanceConnectionName = await getConfig('INSTANCE_CONNECTION_NAME');
	//console.log('🛠️ instanceConnectionName=', JSON.stringify(instanceConnectionName)); // For Debugging

	/*if (!pool) {
		const connector = new Connector();
		const clientOpts = await connector.getOptions({
			instanceConnectionName: 'flash8-sandbox:us-central1:flash8-postgres',
			ipType: IpAddressTypes.PUBLIC
		});

		pool = new Pool({
			...clientOpts,
			user: 'postgres',
			password: 'password',
			database: 'postgres',
			max: 5
		});
	}
	return pool;*/

	// build the driver 
	const connector = new Connector();
  	const socketOpts = await connector.getOptions({
    instanceConnectionName,       // PROJECT:REGION:INSTANCE
    ipType: IpAddressTypes.PUBLIC,             // or 'PRIVATE' / 'PSC'
    // authType: 'IAM',           // if using IAM DB auth
  });

  // 3. Now create your pg Pool, adding in your DB creds
  const pool = new Pool({
    ...socketOpts,
    user:     await getConfig('DB_USER'),
    password: await getConfig('DB_PASSWORD'),
    database: await getConfig('DB_NAME'),
    max:      5,                 // optional pool sizing
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
