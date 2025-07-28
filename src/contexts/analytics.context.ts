import { createContext } from 'react';

export interface AnalyticsEventProperties {
	[key: string]: string | number | boolean | undefined;
}

export interface AnalyticsContextType {
	// Event tracking
	track: (eventName: string, properties?: AnalyticsEventProperties) => void;

	// User identification
	identify: (walletAddress: string, properties?: AnalyticsEventProperties) => void;

	// Page tracking
	trackPage: (pageName: string, properties?: AnalyticsEventProperties) => void;

	// Web3-specific events
	trackWalletConnection: (walletType: string, walletAddress: string) => void;
	trackWalletDisconnection: () => void;
	trackTransaction: (
		type: 'supply' | 'withdraw' | 'borrow' | 'repay',
		token: string,
		amount: string,
		success: boolean,
	) => void;
	trackTransactionStart: (type: 'supply' | 'withdraw' | 'borrow' | 'repay', token: string, amount: string) => void;
	trackTransactionComplete: (
		type: 'supply' | 'withdraw' | 'borrow' | 'repay',
		token: string,
		amount: string,
		transactionHash: string,
	) => void;
	trackTransactionError: (
		type: 'supply' | 'withdraw' | 'borrow' | 'repay',
		token: string,
		amount: string,
		error: string,
	) => void;

	// NFT-specific events
	trackNFTCollateralDeposit: (collectionAddress: string, tokenId: string, success: boolean) => void;
	trackNFTCollateralWithdraw: (collectionAddress: string, tokenId: string, success: boolean) => void;

	// Analytics state
	isInitialized: boolean;
	isEnabled: boolean;
}

export const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);
