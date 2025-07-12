/**
 * Transaction configurations for BaseTransactionModal component
 * 
 * This file contains pre-configured transaction settings for different operation types.
 */

import type { TransactionConfig } from './transaction.types';

// Transaction configurations for each operation type
export const TRANSACTION_CONFIGS: Record<string, TransactionConfig> = {
	supply: {
		type: 'supply',
		contractFunction: 'mint',
		requiresApproval: true,
	},
	borrow: {
		type: 'borrow',
		contractFunction: 'borrow',
		requiresApproval: false,
	},
	withdraw: {
		type: 'withdraw',
		contractFunction: 'redeem',
		requiresApproval: false,
		needsExchangeRateCalculation: true,
	},
	repay: {
		type: 'repay',
		contractFunction: 'repayBorrow',
		requiresApproval: true,
	},
};