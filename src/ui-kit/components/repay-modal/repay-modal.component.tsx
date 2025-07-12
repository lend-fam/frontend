import { type FC } from 'react';
import type { Address } from 'viem';

import { BaseTransactionModal } from '../base-transaction-modal/base-transaction-modal.component';
import type { TransactionConfig } from '../base-transaction-modal/transaction.types';

import css from './repay-modal.module.css';

interface RepayModalProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	borrowAPY: string;
}

const REPAY_CONFIG: TransactionConfig = {
	type: 'repay',
	contractFunction: 'repayBorrow',
	requiresApproval: true,
};

export const RepayModal: FC<RepayModalProps> = ({ isOpen, onClose, marketAddress, borrowAPY }) => {
	// Green theme for repay button using CSS module class
	const repayTheme = {
		submitButton: css.submitButton,
	};

	return (
		<BaseTransactionModal
			isOpen={isOpen}
			onClose={onClose}
			marketAddress={marketAddress}
			config={REPAY_CONFIG}
			borrowAPY={borrowAPY}
			theme={repayTheme}
		/>
	);
};
