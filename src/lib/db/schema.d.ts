export type ProcessStatus = 'processing' | 'completed' | 'failed';

export type Process = {
	id: string;
	name: string;
	status: ProcessStatus;
	outputs?: string | null;
	original_file_name?: string | null;
	original_file_path?: string | null;
	original_file_size?: number | null;
	created_at: Date | string;
	updated_at: Date | string;
};
