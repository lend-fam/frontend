import { type FC, type ReactNode, useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { AnalyticsContext, type AnalyticsContextType, type AnalyticsEventProperties } from './analytics.context';

interface AnalyticsProviderProps {
	children: ReactNode;
}

export const AnalyticsProvider: FC<AnalyticsProviderProps> = ({ children }) => {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isEnabled, setIsEnabled] = useState(false);

	// Initialize PostHog
	useEffect(() => {
		const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
		const apiHost = import.meta.env.VITE_POSTHOG_API_HOST || 'https://app.posthog.com';

		if (apiKey) {
			try {
				posthog.init(apiKey, {
					api_host: apiHost,
					loaded: () => {
						setIsInitialized(true);
						setIsEnabled(true);
					},
					capture_pageview: false, // We'll handle page views manually
					persistence: 'localStorage',
					// Privacy settings for Web3
					respect_dnt: true,
					opt_out_capturing_by_default: false,
					// Disable session recording for privacy
					disable_session_recording: true,
				});
			} catch (error) {
				console.error('Failed to initialize PostHog:', error);
				setIsInitialized(true);
				setIsEnabled(false);
			}
		} else {
			// Analytics disabled - API key not configured
			setIsInitialized(true);
			setIsEnabled(false);
		}

		// Cleanup on unmount
		return () => {
			if (isEnabled) {
				posthog.reset();
			}
		};
	}, [isEnabled]);

	// Generic event tracking
	const track = (eventName: string, properties?: AnalyticsEventProperties) => {
		if (!isEnabled) return;

		try {
			posthog.capture(eventName, properties);
		} catch (error) {
			console.error('Analytics tracking error:', error);
		}
	};

	// User identification for wallet-based analytics
	const identify = (walletAddress: string, properties?: AnalyticsEventProperties) => {
		if (!isEnabled) return;

		try {
			posthog.identify(walletAddress, {
				wallet_address: walletAddress,
				...properties,
			});
		} catch (error) {
			console.error('Analytics identify error:', error);
		}
	};

	// Page tracking
	const trackPage = (pageName: string, properties?: AnalyticsEventProperties) => {
		if (!isEnabled) return;

		try {
			posthog.capture('$pageview', {
				$current_url: window.location.href,
				page_name: pageName,
				...properties,
			});
		} catch (error) {
			console.error('Analytics page tracking error:', error);
		}
	};

	// Wallet connection tracking
	const trackWalletConnection = (walletType: string, walletAddress: string) => {
		track('wallet_connected', {
			wallet_type: walletType,
			wallet_address: walletAddress,
		});
		// Also identify the user
		identify(walletAddress, { wallet_type: walletType });
	};

	const trackWalletDisconnection = () => {
		track('wallet_disconnected');
		// Reset user identification
		if (isEnabled) {
			try {
				posthog.reset();
			} catch (error) {
				console.error('Analytics reset error:', error);
			}
		}
	};

	// Transaction tracking
	const trackTransaction = (
		type: 'supply' | 'withdraw' | 'borrow' | 'repay',
		token: string,
		amount: string,
		success: boolean,
	) => {
		track('transaction_completed', {
			transaction_type: type,
			token,
			amount,
			success,
		});
	};

	const trackTransactionStart = (type: 'supply' | 'withdraw' | 'borrow' | 'repay', token: string, amount: string) => {
		track('transaction_started', {
			transaction_type: type,
			token,
			amount,
		});
	};

	const trackTransactionComplete = (
		type: 'supply' | 'withdraw' | 'borrow' | 'repay',
		token: string,
		amount: string,
		transactionHash: string,
	) => {
		track('transaction_success', {
			transaction_type: type,
			token,
			amount,
			transaction_hash: transactionHash,
		});
	};

	const trackTransactionError = (
		type: 'supply' | 'withdraw' | 'borrow' | 'repay',
		token: string,
		amount: string,
		error: string,
	) => {
		track('transaction_error', {
			transaction_type: type,
			token,
			amount,
			error_message: error,
		});
	};

	// NFT collateral tracking
	const trackNFTCollateralDeposit = (collectionAddress: string, tokenId: string, success: boolean) => {
		track('nft_collateral_deposit', {
			collection_address: collectionAddress,
			token_id: tokenId,
			success,
		});
	};

	const trackNFTCollateralWithdraw = (collectionAddress: string, tokenId: string, success: boolean) => {
		track('nft_collateral_withdraw', {
			collection_address: collectionAddress,
			token_id: tokenId,
			success,
		});
	};

	const contextValue: AnalyticsContextType = {
		track,
		identify,
		trackPage,
		trackWalletConnection,
		trackWalletDisconnection,
		trackTransaction,
		trackTransactionStart,
		trackTransactionComplete,
		trackTransactionError,
		trackNFTCollateralDeposit,
		trackNFTCollateralWithdraw,
		isInitialized,
		isEnabled,
	};

	return <AnalyticsContext.Provider value={contextValue}>{children}</AnalyticsContext.Provider>;
};
