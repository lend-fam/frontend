import { type FC, type ReactNode } from 'react';
import { useToast } from '../hooks/use-toast.hook';
import { ToastContainer } from '../ui-kit/components/toast/toast.component';
import { ToastContext } from './toast.context';

interface ToastProviderProps {
	children: ReactNode;
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
	const { toasts, showToast, removeToast } = useToast();

	const showSuccess = (message: string) => showToast(message, 'success');
	const showError = (message: string) => showToast(message, 'error');
	const showInfo = (message: string) => showToast(message, 'info');
	const showWarning = (message: string) => showToast(message, 'warning');

	return (
		<ToastContext.Provider
			value={{
				showToast,
				showSuccess,
				showError,
				showInfo,
				showWarning,
			}}>
			{children}
			<ToastContainer toasts={toasts} onRemove={removeToast} />
		</ToastContext.Provider>
	);
};
