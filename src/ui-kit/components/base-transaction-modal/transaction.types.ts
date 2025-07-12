import type { Address } from 'viem';

export type TransactionType = 'supply' | 'borrow' | 'withdraw' | 'repay';

export interface TransactionConfig {
	type: TransactionType;
	contractFunction: string;
	requiresApproval: boolean;
	needsExchangeRateCalculation?: boolean;
}

export interface TransactionState {
	// Transaction progress
	isProcessing: boolean;
	hasAutoProceeded: boolean;

	// Approval flow
	needsApproval: boolean;
	isApprovePending: boolean;
	isApproveConfirming: boolean;
	isApproveSuccess: boolean;
	isApproveError: boolean;

	// Main transaction
	isTransactionPending: boolean;
	isTransactionConfirming: boolean;
	isTransactionSuccess: boolean;
	isTransactionError: boolean;
}

export interface TokenData {
	underlyingTokenAddress?: Address;
	tokenDecimals?: number;
	cleanSymbol: string;
}

export interface BalanceData {
	// Common balance data
	walletBalance?: bigint;

	// Supply/Repay specific
	balance?: { value: bigint };

	// Borrow specific
	availableToBorrow?: bigint;
	accountLiquidity?: [bigint, bigint, bigint];
	availableLiquidity?: bigint;

	// Withdraw specific
	cTokenBalance?: bigint;
	exchangeRate?: bigint;
	maxWithdrawable?: bigint;

	// Repay specific
	borrowBalance?: bigint;
	maxRepayable?: bigint;
}

export interface ApprovalSettings {
	useMaxApproval: boolean;
	currentAllowance?: bigint;
}

export interface TransactionOverviewRow {
	label: string;
	value: string;
	valueClassName?: string;
}

export interface BaseTransactionModalProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	config: TransactionConfig;

	// Type-specific props
	supplyAPY?: string;
	borrowAPY?: string;
	isCollateralEnabled?: boolean;
	tokenSymbol?: string;
	availableLiquidity?: bigint;

	// Theme override
	theme?: Partial<Record<string, string>>;
}

export interface TransactionCallbacks {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}
