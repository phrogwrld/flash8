
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import dotenv from 'dotenv';
dotenv.config();

const client = new SecretManagerServiceClient();

async function fetchSecret(name: string): Promise<string> {
  const projectId = process.env.GCP_PROJECT_ID!;
  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${name}/versions/latest`,
  });
  return version.payload?.data?.toString('utf8') || '';
}

export async function getConfig(key: string): Promise<string> {
  if (process.env.NODE_ENV !== 'production') {
    const val = process.env[key];
    if (!val) throw new Error(`Missing env var ${key}`);
    return val;
  }
  return fetchSecret(key);
}
