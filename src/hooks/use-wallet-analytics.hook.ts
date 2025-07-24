import { useEffect, useRef } from 'react';
import { useAccount, useConnections } from 'wagmi';
import { useAnalyticsContext } from './use-analytics-context.hook';

/**
 * Hook that automatically tracks wallet connection and disconnection events
 * Should be used at the app level to monitor wallet state changes
 */
export const useWalletAnalytics = () => {
	const { address, isConnected, connector } = useAccount();
	const connections = useConnections();
	const { trackWalletConnection, trackWalletDisconnection, identify } = useAnalyticsContext();
	
	// Use refs to track previous state and prevent duplicate events
	const prevConnectedRef = useRef<boolean>(false);
	const prevAddressRef = useRef<string | undefined>(undefined);

	useEffect(() => {
		const wasConnected = prevConnectedRef.current;
		const prevAddress = prevAddressRef.current;
		
		// Wallet connected (first time or address changed)
		if (isConnected && address && (!wasConnected || address !== prevAddress)) {
			const walletType = connector?.name || 'unknown';
			
			// Track wallet connection event
			trackWalletConnection(walletType, address);
			
			console.log('Analytics: Wallet connected', { walletType, address });
		}
		
		// Wallet disconnected
		else if (!isConnected && wasConnected) {
			trackWalletDisconnection();
			console.log('Analytics: Wallet disconnected');
		}

		// Update refs
		prevConnectedRef.current = isConnected;
		prevAddressRef.current = address;
	}, [isConnected, address, connector?.name, trackWalletConnection, trackWalletDisconnection]);

	// Also identify user when wallet is connected (for cases where analytics wasn't initialized yet)
	useEffect(() => {
		if (isConnected && address && connector?.name) {
			identify(address, { wallet_type: connector.name });
		}
	}, [isConnected, address, connector?.name, identify]);

	return {
		isConnected,
		address,
		walletType: connector?.name,
		totalConnections: connections.length,
	};
};