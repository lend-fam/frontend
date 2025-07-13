import { type FC } from 'react';
import type { Address } from 'viem';

import { BaseTransactionModal } from '../base-transaction-modal/base-transaction-modal.component';
import type { TransactionConfig } from '../base-transaction-modal/transaction.types';

interface SupplyModalProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	supplyAPY: string;
	isCollateralEnabled: boolean;
	onSuccess?: () => void;
}

const SUPPLY_CONFIG: TransactionConfig = {
	type: 'supply',
	contractFunction: 'mint',
	requiresApproval: true,
};

export const SupplyModal: FC<SupplyModalProps> = ({
	isOpen,
	onClose,
	marketAddress,
	supplyAPY,
	isCollateralEnabled,
	onSuccess,
}) => {
	return (
		<BaseTransactionModal
			isOpen={isOpen}
			onClose={onClose}
			marketAddress={marketAddress}
			config={SUPPLY_CONFIG}
			supplyAPY={supplyAPY}
			isCollateralEnabled={isCollateralEnabled}
			onSuccess={onSuccess}
		/>
	);
};
