import { error, redirect } from '@sveltejs/kit';
import { processService } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		const process = await processService.getById(id);

		if (!process) {
			throw error(404, 'File not found');
		}

		if (process.status !== 'completed') {
			throw error(400, `File is not ready for download. Current status: ${process.status}`);
		}

		if (!process.outputs) {
			throw error(500, 'Download URL not available');
		}

		throw redirect(302, process.outputs);
	} catch (err) {
		console.error('Download error:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(500, 'Failed to download file');
	}
};
