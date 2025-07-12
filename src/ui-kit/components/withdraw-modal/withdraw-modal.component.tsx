import { type FC } from 'react';
import type { Address } from 'viem';

import { BaseTransactionModal } from '../base-transaction-modal/base-transaction-modal.component';
import type { TransactionConfig } from '../base-transaction-modal/transaction.types';

interface WithdrawModalProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	tokenSymbol: string;
	supplyAPY: string;
}

const withdrawConfig: TransactionConfig = {
	type: 'withdraw',
	contractFunction: 'redeem',
	requiresApproval: false,
	needsExchangeRateCalculation: true,
};

export const WithdrawModal: FC<WithdrawModalProps> = ({ isOpen, onClose, marketAddress, tokenSymbol, supplyAPY }) => {
	return (
		<BaseTransactionModal
			isOpen={isOpen}
			onClose={onClose}
			marketAddress={marketAddress}
			config={withdrawConfig}
			supplyAPY={supplyAPY}
			tokenSymbol={tokenSymbol}
		/>
	);
};
