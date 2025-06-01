import { vttFiles } from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import { Storage } from '@google-cloud/storage';
import { FileUploadSchema } from '$lib/schema';
import { ZodError } from 'zod/v4';

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
		const name = formData.get('name') as string;

		console.log(`File upload request received with name: ${name}, file: ${file?.name}`);

		const validatedData = FileUploadSchema.safeParse({
			name: name || undefined,
			file: file
		});

		if (!validatedData.success) {
			return json(
				{
					error: validatedData.error.issues[0]?.message || 'Validation failed'
				},
				{ status: 400 }
			);
		}

		const fileId = await vttFiles.create(validatedData.data.file.name);
		console.log(`Created DB record with ID: ${fileId}`);

		const bucket = storage.bucket(BUCKET_NAME);
		const fileName = `uploads/${fileId}__${validatedData.data.file.name}`;
		const cloudFile = bucket.file(fileName);

		const arrayBuffer = await validatedData.data.file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		await cloudFile.save(buffer, {
			metadata: {
				contentType: 'text/vtt',
				metadata: {
					originalName: validatedData.data.file.name,
					uploadedAt: new Date().toISOString()
				}
			}
		});

		console.log(`File uploaded to Cloud Storage: ${fileName}`);

		return json({
			success: true,
			message: 'File uploaded successfully!',
			fileId: fileId
		});
	} catch (error) {
		console.error('Upload error:', error);

		if (error instanceof ZodError) {
			return json({ error: error.issues[0]?.message || 'Validation failed' }, { status: 400 });
		}

		return json({ success: false, error: 'Failed to create file' }, { status: 500 });
	}
};
