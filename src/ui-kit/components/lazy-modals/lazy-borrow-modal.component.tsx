import { type FC, Suspense, lazy } from 'react';
import type { Address } from 'viem';

interface LazyBorrowModalProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	tokenSymbol: string;
	borrowAPY: string;
	availableLiquidity: bigint;
	onSuccess?: () => void;
}

// Lazy load the borrow modal component to reduce initial bundle size
const BorrowModal = lazy(() =>
	import('../borrow-modal/borrow-modal.component').then((module) => ({
		default: module.BorrowModal,
	})),
);

// Modal loading fallback component (minimal since it's only shown briefly)
const ModalLoadingFallback: FC = () => null;

export const LazyBorrowModal: FC<LazyBorrowModalProps> = (props) => {
	// Only render the suspense boundary when modal is open to avoid unnecessary loading
	if (!props.isOpen) {
		return null;
	}

	return (
		<Suspense fallback={<ModalLoadingFallback />}>
			<BorrowModal {...props} />
		</Suspense>
	);
};
