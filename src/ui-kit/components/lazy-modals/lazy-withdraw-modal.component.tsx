import { type FC, Suspense, lazy } from 'react';
import type { Address } from 'viem';

interface LazyWithdrawModalProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	tokenSymbol: string;
	supplyAPY: string;
	onSuccess?: () => void;
}

// Lazy load the withdraw modal component to reduce initial bundle size
const WithdrawModal = lazy(() =>
	import('../withdraw-modal/withdraw-modal.component').then((module) => ({
		default: module.WithdrawModal,
	})),
);

// Modal loading fallback component (minimal since it's only shown briefly)
const ModalLoadingFallback: FC = () => null;

export const LazyWithdrawModal: FC<LazyWithdrawModalProps> = (props) => {
	// Only render the suspense boundary when modal is open to avoid unnecessary loading
	if (!props.isOpen) {
		return null;
	}

	return (
		<Suspense fallback={<ModalLoadingFallback />}>
			<WithdrawModal {...props} />
		</Suspense>
	);
};
