import { processService } from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import { Storage } from '@google-cloud/storage';
import { FileUploadSchema } from '$lib/schema';
import { ZodError } from 'zod/v4';

const storage = new Storage();
const BUCKET_NAME = 'raw-data-sandbox';

export const GET: RequestHandler = async () => {
	try {
		const processes = await processService.getAll();
		return json(processes);
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

		const finalName = validatedData.data.name ?? validatedData.data.file.name;

		const processId = await processService.create(
			finalName,
			validatedData.data.file.name,
			undefined,
			validatedData.data.file.size
		);

		console.log(`Created DB record with ID: ${processId}`);

		const bucket = storage.bucket(BUCKET_NAME);
		const fileName = `uploads/${processId}__${validatedData.data.name}.vtt`;
		const cloudFile = bucket.file(fileName);

		const arrayBuffer = await validatedData.data.file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		await cloudFile.save(buffer, {
			metadata: {
				contentType: 'text/vtt',
				metadata: {
					processId: processId,
					originalName: validatedData.data.file.name,
					uploadedAt: new Date().toISOString()
				}
			}
		});

		console.log(`File uploaded to Cloud Storage: ${fileName}`);

		const fileUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;
		await processService.updateFileMetadata(processId, {
			originalFilePath: fileUrl
		});

		return json({
			success: true,
			message: 'File uploaded successfully!',
			processId: processId,
			fileName: fileName
		});
	} catch (error) {
		console.error('Upload error:', error);

		if (error instanceof ZodError) {
			return json({ error: error.issues[0]?.message || 'Validation failed' }, { status: 400 });
		}

		return json({ success: false, error: 'Failed to create file' }, { status: 500 });
	}
};
