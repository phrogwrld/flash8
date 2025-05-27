import { vttFiles } from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const BUCKET_NAME = 'raw-data-sandbox';

export const GET: RequestHandler = async () => {
	try {
		const files = await vttFiles.getAll();
		return json(files);
	} catch (error) {
		console.error('Error fetching files:', error);
		return json({ error: 'Failed to fetch files' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file || !file.name.endsWith('.vtt')) {
			return json({ error: 'Please upload a valid .vtt file' }, { status: 400 });
		}

		// 1. Create database record first
		const fileId = await vttFiles.create(file.name);
		console.log(`Created DB record with ID: ${fileId}`);

		// 2. Upload to Cloud Storage with ID in filename
		const bucket = storage.bucket(BUCKET_NAME);
		const fileName = `uploads/${fileId}__${file.name}`;
		const cloudFile = bucket.file(fileName);

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		await cloudFile.save(buffer, {
			metadata: {
				contentType: 'text/vtt',
				metadata: {
					originalName: file.name,
					uploadedAt: new Date().toISOString()
				}
			}
		});

		console.log(`File uploaded to Cloud Storage: ${fileName}`);

		return json({
			success: true,
			message: 'File uploaded successfully',
			fileId: fileId
		});
	} catch (error) {
		console.error('Error creating file:', error);
		return json({ success: false, error: 'Failed to create file' }, { status: 500 });
	}
};
