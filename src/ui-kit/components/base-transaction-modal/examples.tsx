/**
 * Usage examples for BaseTransactionModal component
 * 
 * This file demonstrates how to configure the BaseTransactionModal for different transaction types.
 * It shows the transaction configs and props needed for Supply, Borrow, Withdraw, and Repay operations.
 */

import type { FC } from 'react';
import type { Address } from 'viem';
import { BaseTransactionModal } from './base-transaction-modal.component';
import { TRANSACTION_CONFIGS } from './transaction.configs';

// Example usage component for Supply modal
interface SupplyModalExampleProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	supplyAPY: string;
	isCollateralEnabled: boolean;
}

export const SupplyModalExample: FC<SupplyModalExampleProps> = ({
	isOpen,
	onClose,
	marketAddress,
	supplyAPY,
	isCollateralEnabled,
}) => (
	<BaseTransactionModal
		isOpen={isOpen}
		onClose={onClose}
		marketAddress={marketAddress}
		config={TRANSACTION_CONFIGS.supply}
		supplyAPY={supplyAPY}
		isCollateralEnabled={isCollateralEnabled}
	/>
);

// Example usage component for Borrow modal
interface BorrowModalExampleProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	borrowAPY: string;
	availableLiquidity: bigint;
}

export const BorrowModalExample: FC<BorrowModalExampleProps> = ({
	isOpen,
	onClose,
	marketAddress,
	borrowAPY,
	availableLiquidity,
}) => (
	<BaseTransactionModal
		isOpen={isOpen}
		onClose={onClose}
		marketAddress={marketAddress}
		config={TRANSACTION_CONFIGS.borrow}
		borrowAPY={borrowAPY}
		availableLiquidity={availableLiquidity}
	/>
);

// Example usage component for Withdraw modal
interface WithdrawModalExampleProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	supplyAPY: string;
}

export const WithdrawModalExample: FC<WithdrawModalExampleProps> = ({
	isOpen,
	onClose,
	marketAddress,
	supplyAPY,
}) => (
	<BaseTransactionModal
		isOpen={isOpen}
		onClose={onClose}
		marketAddress={marketAddress}
		config={TRANSACTION_CONFIGS.withdraw}
		supplyAPY={supplyAPY}
	/>
);

// Example usage component for Repay modal
interface RepayModalExampleProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	borrowAPY: string;
}

export const RepayModalExample: FC<RepayModalExampleProps> = ({
	isOpen,
	onClose,
	marketAddress,
	borrowAPY,
}) => (
	<BaseTransactionModal
		isOpen={isOpen}
		onClose={onClose}
		marketAddress={marketAddress}
		config={TRANSACTION_CONFIGS.repay}
		borrowAPY={borrowAPY}
	/>
);