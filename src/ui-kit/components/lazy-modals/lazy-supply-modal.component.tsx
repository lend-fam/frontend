import { type FC, Suspense, lazy } from 'react';
import type { Address } from 'viem';

interface LazySupplyModalProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	supplyAPY: string;
	isCollateralEnabled: boolean;
	onSuccess?: () => void;
}

// Lazy load the supply modal component to reduce initial bundle size
const SupplyModal = lazy(() =>
	import('../supply-modal/supply-modal.component').then((module) => ({
		default: module.SupplyModal,
	})),
);

// Modal loading fallback component (minimal since it's only shown briefly)
const ModalLoadingFallback: FC = () => null;

export const LazySupplyModal: FC<LazySupplyModalProps> = (props) => {
	// Only render the suspense boundary when modal is open to avoid unnecessary loading
	if (!props.isOpen) {
		return null;
	}

	return (
		<Suspense fallback={<ModalLoadingFallback />}>
			<SupplyModal {...props} />
		</Suspense>
	);
};
