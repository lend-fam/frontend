import { useContext } from 'react';
import { ToastContext } from '../contexts/toast.context';
import type { ToastContextType } from '../contexts/toast.context';

export const useToastContext = (): ToastContextType => {
	const context = useContext(ToastContext);
	if (context === undefined) {
		throw new Error('useToastContext must be used within a ToastProvider');
	}
	return context;
};
