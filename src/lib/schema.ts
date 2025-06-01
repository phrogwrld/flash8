import { z } from 'zod/v4';

export const FileUploadSchema = z.object({
	file: z
		.instanceof(File)
		.refine((file) => file.size > 0, { error: 'File cannot be empty' })
		.refine((file) => file.size <= 10 * 1024 * 1024, { error: 'File must be less than 10MB' })
		.refine((file) => file.type === 'text/vtt', { error: 'File must be a valid .vtt file' })
		.refine((file) => file.name.endsWith('.vtt'), { error: 'File must have .vtt extension' }),
	name: z.string().min(1, { error: 'Process name is required' }).max(100, { error: 'Process name too long' }).optional()
});

export const ProcessStatusSchema = z.enum(['processing', 'completed', 'failed']);

export const ProcessSchema = z.object({
	id: z.string(),
	name: z.string(),
	status: ProcessStatusSchema,
	outputs: z.string().nullish(),
	original_file_name: z.string().nullish(),
	original_file_path: z.string().nullish(),
	original_file_size: z.number().nullish(),
	created_at: z.union([z.date(), z.string()]),
	updated_at: z.union([z.date(), z.string()])
});

export type FileUpload = z.infer<typeof FileUploadSchema>;
export type ProcessStatus = z.infer<typeof ProcessStatusSchema>;
export type Process = z.infer<typeof ProcessSchema>;
