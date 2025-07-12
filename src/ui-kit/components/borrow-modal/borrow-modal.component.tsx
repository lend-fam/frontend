import { type FC } from 'react';
import type { Address } from 'viem';

import { BaseTransactionModal } from '../base-transaction-modal/base-transaction-modal.component';
import type { TransactionConfig } from '../base-transaction-modal/transaction.types';

interface BorrowModalProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	tokenSymbol: string;
	borrowAPY: string;
	availableLiquidity: bigint;
}

const borrowConfig: TransactionConfig = {
	type: 'borrow',
	contractFunction: 'borrow',
	requiresApproval: false,
};

export const BorrowModal: FC<BorrowModalProps> = ({
	isOpen,
	onClose,
	marketAddress,
	tokenSymbol,
	borrowAPY,
	availableLiquidity,
}) => {
	return (
		<BaseTransactionModal
			isOpen={isOpen}
			onClose={onClose}
			marketAddress={marketAddress}
			config={borrowConfig}
			borrowAPY={borrowAPY}
			tokenSymbol={tokenSymbol}
			availableLiquidity={availableLiquidity}
		/>
	);
};
