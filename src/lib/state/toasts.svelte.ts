type Toast = {
	id: string;
	type: 'info' | 'success' | 'error' | 'progress';
	message?: string;
	progress?: number;
	duration?: number;
};

class ToastsBase {
	values: Toast[] = $state([]);

	add(toast: Omit<Toast, 'id'>) {
		const id = Math.random().toString(36).substring(2, 9);
		const newToast: Toast = { id, ...toast };
		this.values.push(newToast);

		if (toast.type !== 'progress') {
			setTimeout(() => {
				this.remove(id);
			}, 5000);
		}

		return id;
	}

	remove(id: string) {
		this.values = this.values.filter((t) => t.id !== id);
	}
}

export const Toasts = new ToastsBase();
