import { type FC, type ReactNode, useCallback, useMemo } from 'react';
import { useToast } from '../hooks/use-toast.hook';
import { ToastContainer } from '../ui-kit/components/toast/toast.component';
import { ToastContext } from './toast.context';

interface ToastProviderProps {
	children: ReactNode;
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
	const { toasts, showToast, removeToast } = useToast();

	const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
	const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
	const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);
	const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);

	const contextValue = useMemo(
		() => ({
			showToast,
			showSuccess,
			showError,
			showInfo,
			showWarning,
		}),
		[showToast, showSuccess, showError, showInfo, showWarning],
	);

	return (
		<ToastContext.Provider value={contextValue}>
			{children}
			<ToastContainer toasts={toasts} onRemove={removeToast} />
		</ToastContext.Provider>
	);
};
