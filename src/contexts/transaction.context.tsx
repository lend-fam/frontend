import { createContext, useReducer, type ReactNode } from 'react';
import type { Hash, Address } from 'viem';

export interface TransactionInfo {
	hash: Hash;
	type: 'supply' | 'borrow' | 'withdraw' | 'repay' | 'approval' | 'collateral';
	marketAddress?: Address;
	tokenAddress?: Address;
	amount?: string;
	timestamp: number;
	status: 'pending' | 'confirming' | 'success' | 'failed';
	blockNumber?: number;
	gasUsed?: string;
	errorMessage?: string;
}

interface TransactionState {
	transactions: Record<Hash, TransactionInfo>;
	pendingCount: number;
	recentTransactions: TransactionInfo[];
}

type TransactionAction =
	| { type: 'ADD_TRANSACTION'; payload: TransactionInfo }
	| { type: 'UPDATE_TRANSACTION'; payload: { hash: Hash; updates: Partial<TransactionInfo> } }
	| { type: 'REMOVE_TRANSACTION'; payload: Hash }
	| { type: 'CLEAR_OLD_TRANSACTIONS'; payload: number };

const initialState: TransactionState = {
	transactions: {},
	pendingCount: 0,
	recentTransactions: [],
};

function transactionReducer(state: TransactionState, action: TransactionAction): TransactionState {
	switch (action.type) {
		case 'ADD_TRANSACTION': {
			const newTransactions = {
				...state.transactions,
				[action.payload.hash]: action.payload,
			};

			const allTransactions = Object.values(newTransactions) as TransactionInfo[];
			const pendingCount = allTransactions.filter(
				(tx: TransactionInfo) => tx.status === 'pending' || tx.status === 'confirming',
			).length;

			const recentTransactions = allTransactions
				.sort((a: TransactionInfo, b: TransactionInfo) => b.timestamp - a.timestamp)
				.slice(0, 10);

			return {
				transactions: newTransactions,
				pendingCount,
				recentTransactions,
			};
		}

		case 'UPDATE_TRANSACTION': {
			const { hash, updates } = action.payload;
			const existingTx = state.transactions[hash];

			if (!existingTx) return state;

			const updatedTx = { ...existingTx, ...updates };
			const newTransactions = {
				...state.transactions,
				[hash]: updatedTx,
			};

			const allTransactions = Object.values(newTransactions) as TransactionInfo[];
			const pendingCount = allTransactions.filter(
				(tx: TransactionInfo) => tx.status === 'pending' || tx.status === 'confirming',
			).length;

			const recentTransactions = allTransactions
				.sort((a: TransactionInfo, b: TransactionInfo) => b.timestamp - a.timestamp)
				.slice(0, 10);

			return {
				transactions: newTransactions,
				pendingCount,
				recentTransactions,
			};
		}

		case 'REMOVE_TRANSACTION': {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { [action.payload]: _, ...remaining } = state.transactions;

			const allTransactions = Object.values(remaining);
			const pendingCount = allTransactions.filter(
				(tx) => tx.status === 'pending' || tx.status === 'confirming',
			).length;

			const recentTransactions = allTransactions.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

			return {
				transactions: remaining,
				pendingCount,
				recentTransactions,
			};
		}

		case 'CLEAR_OLD_TRANSACTIONS': {
			const threshold = action.payload;
			const filteredTransactions = Object.fromEntries(
				Object.entries(state.transactions).filter(
					([, tx]) => tx.timestamp > threshold || tx.status === 'pending' || tx.status === 'confirming',
				),
			);

			const allTransactions = Object.values(filteredTransactions);
			const pendingCount = allTransactions.filter(
				(tx) => tx.status === 'pending' || tx.status === 'confirming',
			).length;

			const recentTransactions = allTransactions.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

			return {
				transactions: filteredTransactions,
				pendingCount,
				recentTransactions,
			};
		}

		default:
			return state;
	}
}

interface TransactionContextValue extends TransactionState {
	addTransaction: (transaction: Omit<TransactionInfo, 'timestamp'>) => void;
	updateTransaction: (hash: Hash, updates: Partial<TransactionInfo>) => void;
	removeTransaction: (hash: Hash) => void;
	clearOldTransactions: (olderThanHours?: number) => void;
	getTransactionsByMarket: (marketAddress: Address) => TransactionInfo[];
	getTransactionsByType: (type: TransactionInfo['type']) => TransactionInfo[];
}

// eslint-disable-next-line react-refresh/only-export-components
export const TransactionContext = createContext<TransactionContextValue | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(transactionReducer, initialState);

	const addTransaction = (transaction: Omit<TransactionInfo, 'timestamp'>) => {
		dispatch({
			type: 'ADD_TRANSACTION',
			payload: {
				...transaction,
				timestamp: Date.now(),
			},
		});
	};

	const updateTransaction = (hash: Hash, updates: Partial<TransactionInfo>) => {
		dispatch({
			type: 'UPDATE_TRANSACTION',
			payload: { hash, updates },
		});
	};

	const removeTransaction = (hash: Hash) => {
		dispatch({
			type: 'REMOVE_TRANSACTION',
			payload: hash,
		});
	};

	const clearOldTransactions = (olderThanHours = 24) => {
		const threshold = Date.now() - olderThanHours * 60 * 60 * 1000;
		dispatch({
			type: 'CLEAR_OLD_TRANSACTIONS',
			payload: threshold,
		});
	};

	const getTransactionsByMarket = (marketAddress: Address): TransactionInfo[] => {
		return Object.values(state.transactions).filter((tx) => tx.marketAddress === marketAddress);
	};

	const getTransactionsByType = (type: TransactionInfo['type']): TransactionInfo[] => {
		return Object.values(state.transactions).filter((tx) => tx.type === type);
	};

	const value: TransactionContextValue = {
		...state,
		addTransaction,
		updateTransaction,
		removeTransaction,
		clearOldTransactions,
		getTransactionsByMarket,
		getTransactionsByType,
	};

	return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}
