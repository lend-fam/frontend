import { useCallback, useState } from 'react';
import { useToastContext } from './use-toast-context.hook';

interface UseClipboardOptions {
	resetDelay?: number;
	showSuccessToast?: boolean;
	showErrorToast?: boolean;
	successMessage?: string;
}

interface UseClipboardReturn {
	isCopied: boolean;
	copyToClipboard: (text: string) => Promise<boolean>;
	error: string | null;
}

/**
 * Modern clipboard hook using navigator.clipboard API
 * Removes deprecated document.execCommand('copy') fallback
 * Includes toast notifications for user feedback
 */
export const useClipboard = (options: UseClipboardOptions = {}): UseClipboardReturn => {
	const {
		resetDelay = 2000,
		showSuccessToast = true,
		showErrorToast = true,
		successMessage = 'Copied to clipboard',
	} = options;

	const [isCopied, setIsCopied] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { showSuccess, showError } = useToastContext();

	const copyToClipboard = useCallback(
		async (text: string): Promise<boolean> => {
			setError(null);

			// Check if clipboard API is available
			if (!navigator.clipboard || !navigator.clipboard.writeText) {
				const errorMessage = 'Clipboard API not supported in this browser';
				setError(errorMessage);

				if (showErrorToast) {
					showError(errorMessage);
				}
				return false;
			}

			try {
				await navigator.clipboard.writeText(text);
				setIsCopied(true);
				setTimeout(() => setIsCopied(false), resetDelay);

				if (showSuccessToast) {
					showSuccess(successMessage);
				}
				return true;
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Failed to copy to clipboard';
				setError(errorMessage);

				if (showErrorToast) {
					showError(errorMessage);
				}
				return false;
			}
		},
		[resetDelay, showSuccess, showError, showSuccessToast, showErrorToast, successMessage],
	);

	return {
		isCopied,
		copyToClipboard,
		error,
	};
};
