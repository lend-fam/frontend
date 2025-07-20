import { type FC, useEffect } from 'react';
import css from './toast.module.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
}

interface ToastProps {
	toast: ToastMessage;
	onRemove: (id: string) => void;
}

export const Toast: FC<ToastProps> = ({ toast, onRemove }) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			onRemove(toast.id);
		}, toast.duration || 3000);

		return () => clearTimeout(timer);
	}, [toast.id, toast.duration, onRemove]);

	return <div className={`${css.toast} ${css[toast.type]}`}>{toast.message}</div>;
};

interface ToastContainerProps {
	toasts: ToastMessage[];
	onRemove: (id: string) => void;
}

export const ToastContainer: FC<ToastContainerProps> = ({ toasts, onRemove }) => {
	if (toasts.length === 0) return null;

	return (
		<div className={css.container}>
			{toasts.map((toast) => (
				<Toast key={toast.id} toast={toast} onRemove={onRemove} />
			))}
		</div>
	);
};
