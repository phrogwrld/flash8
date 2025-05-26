import { error, redirect } from '@sveltejs/kit';
import { vttFiles } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		const file = await vttFiles.getById(id);

		if (!file) {
			throw error(404, 'File not found');
		}

		if (file.status !== 'completed') {
			throw error(400, `File is not ready for download. Current status: ${file.status}`);
		}

		if (!file.outputs) {
			throw error(500, 'Download URL not available');
		}

		throw redirect(302, file.outputs);
	} catch (err) {
		console.error('Download error:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(500, 'Failed to download file');
	}
};
