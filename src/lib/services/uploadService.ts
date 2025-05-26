interface UploadResult {
	fileName: string;
	bucketPath: string;
}

interface DatabaseResult {
	success: boolean;
	fileId?: string;
	error?: string;
}

export class UploadService {
	private readonly GCP_UPLOAD_URL = 'https://upload-vtt-subtitle-156260873753.us-central1.run.app';

	async uploadFile(file: File): Promise<{ success: true } | { success: false; error: string }> {
		try {
			// Step 1: Upload to GCP bucket
			const uploadResult = await this.uploadToGCP(file);

			// Step 2: Save to database (triggers processing)
			const dbResult = await this.saveToDatabase({
				fileName: uploadResult.fileName,
				originalName: file.name,
				size: file.size,
				bucketPath: uploadResult.bucketPath
			});

			if (!dbResult.success) {
				throw new Error(dbResult.error || 'Failed to save file to database');
			}

			return { success: true };
		} catch (error) {
			console.error('Upload error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Upload failed'
			};
		}
	}

	private async uploadToGCP(file: File): Promise<UploadResult> {
		const formData = new FormData();
		formData.append('file', file);

		const response = await fetch(this.GCP_UPLOAD_URL, {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(errorText || 'Upload to GCP failed');
		}

		const result = await response.json();
		return {
			fileName: result.fileName || file.name,
			bucketPath: result.bucketPath || `uploads/${file.name}`
		};
	}

	private async saveToDatabase(fileData: {
		fileName: string;
		originalName: string;
		size: number;
		bucketPath: string;
	}): Promise<DatabaseResult> {
		const response = await fetch('/api/files', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(fileData)
		});

		if (!response.ok) {
			return { success: false, error: 'Failed to save file to database' };
		}

		return response.json();
	}

	validateFile(file: File | null): { valid: boolean; error?: string } {
		if (!file) {
			return { valid: false, error: 'Please select a file' };
		}

		if (file.type !== 'text/vtt' && !file.name.endsWith('.vtt')) {
			return { valid: false, error: 'Please select a valid .vtt file' };
		}

		return { valid: true };
	}
}

export const uploadService = new UploadService();
