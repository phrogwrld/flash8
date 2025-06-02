import dotenv from 'dotenv';
dotenv.config();

export function getConfig(key: string): string {
	const val = process.env[key];
	if (!val) {
		throw new Error(`Missing environment variable: ${key}`);
	}
	return val;
}
