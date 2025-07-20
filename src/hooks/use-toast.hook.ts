import { useCallback, useState } from 'react';
import type { ToastMessage, ToastType } from '../ui-kit/components/toast/toast.component';

interface UseToastReturn {
	toasts: ToastMessage[];
	showToast: (message: string, type?: ToastType, duration?: number) => void;
	removeToast: (id: string) => void;
	clearToasts: () => void;
}

export const useToast = (): UseToastReturn => {
	const [toasts, setToasts] = useState<ToastMessage[]>([]);

	const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
		const id = Math.random().toString(36).substr(2, 9);
		const newToast: ToastMessage = { id, message, type, duration };

		setToasts((prev) => [...prev, newToast]);
	}, []);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	const clearToasts = useCallback(() => {
		setToasts([]);
	}, []);

	return {
		toasts,
		showToast,
		removeToast,
		clearToasts,
	};
};
