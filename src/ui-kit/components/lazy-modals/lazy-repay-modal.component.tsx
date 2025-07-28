import { type FC, Suspense, lazy } from 'react';
import type { Address } from 'viem';

interface LazyRepayModalProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	tokenSymbol: string;
	borrowAPY: string;
	onSuccess?: () => void;
}

// Lazy load the repay modal component to reduce initial bundle size
const RepayModal = lazy(() =>
	import('../repay-modal/repay-modal.component').then((module) => ({
		default: module.RepayModal,
	})),
);

// Modal loading fallback component (minimal since it's only shown briefly)
const ModalLoadingFallback: FC = () => null;

export const LazyRepayModal: FC<LazyRepayModalProps> = (props) => {
	// Only render the suspense boundary when modal is open to avoid unnecessary loading
	if (!props.isOpen) {
		return null;
	}

	return (
		<Suspense fallback={<ModalLoadingFallback />}>
			<RepayModal {...props} />
		</Suspense>
	);
};
