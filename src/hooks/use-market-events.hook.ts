import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWatchContractEvent, useAccount } from 'wagmi';
import type { Address } from 'viem';
import { CTOKEN_ABI, ERC20_ABI } from '../contracts';

interface UseMarketEventsOptions {
	marketAddresses?: Address[];
	tokenAddresses?: Address[];
	enabled?: boolean;
}

export function useMarketEvents(options: UseMarketEventsOptions = {}) {
	const { marketAddresses = [], tokenAddresses = [], enabled = true } = options;
	const queryClient = useQueryClient();
	const { address: userAddress } = useAccount();

	// Watch for CToken events (Supply/Redeem/Borrow/Repay)
	useWatchContractEvent({
		address: marketAddresses,
		abi: CTOKEN_ABI,
		eventName: 'Mint',
		args: userAddress ? { minter: userAddress } : undefined,
		onLogs: (logs) => {
			console.log('Supply event detected:', logs);
			// Invalidate market data and balances
			queryClient.invalidateQueries({ queryKey: ['readContract'] });
			queryClient.invalidateQueries({ queryKey: ['balance'] });
			queryClient.invalidateQueries({ queryKey: ['marketData'] });
		},
		enabled: enabled && marketAddresses.length > 0 && !!userAddress,
	});

	useWatchContractEvent({
		address: marketAddresses,
		abi: CTOKEN_ABI,
		eventName: 'Redeem',
		args: userAddress ? { redeemer: userAddress } : undefined,
		onLogs: (logs) => {
			console.log('Withdraw event detected:', logs);
			queryClient.invalidateQueries({ queryKey: ['readContract'] });
			queryClient.invalidateQueries({ queryKey: ['balance'] });
			queryClient.invalidateQueries({ queryKey: ['marketData'] });
		},
		enabled: enabled && marketAddresses.length > 0 && !!userAddress,
	});

	useWatchContractEvent({
		address: marketAddresses,
		abi: CTOKEN_ABI,
		eventName: 'Borrow',
		args: userAddress ? { borrower: userAddress } : undefined,
		onLogs: (logs) => {
			console.log('Borrow event detected:', logs);
			queryClient.invalidateQueries({ queryKey: ['readContract'] });
			queryClient.invalidateQueries({ queryKey: ['balance'] });
			queryClient.invalidateQueries({ queryKey: ['marketData'] });
		},
		enabled: enabled && marketAddresses.length > 0 && !!userAddress,
	});

	useWatchContractEvent({
		address: marketAddresses,
		abi: CTOKEN_ABI,
		eventName: 'RepayBorrow',
		args: userAddress ? { borrower: userAddress } : undefined,
		onLogs: (logs) => {
			console.log('Repay event detected:', logs);
			queryClient.invalidateQueries({ queryKey: ['readContract'] });
			queryClient.invalidateQueries({ queryKey: ['balance'] });
			queryClient.invalidateQueries({ queryKey: ['marketData'] });
		},
		enabled: enabled && marketAddresses.length > 0 && !!userAddress,
	});

	// Watch for ERC20 Transfer events (for balance updates)
	useWatchContractEvent({
		address: tokenAddresses,
		abi: ERC20_ABI,
		eventName: 'Transfer',
		args: userAddress ? { from: userAddress } : undefined,
		onLogs: (logs) => {
			console.log('Token transfer (from user) detected:', logs);
			queryClient.invalidateQueries({ queryKey: ['balance'] });
		},
		enabled: enabled && tokenAddresses.length > 0 && !!userAddress,
	});

	useWatchContractEvent({
		address: tokenAddresses,
		abi: ERC20_ABI,
		eventName: 'Transfer',
		args: userAddress ? { to: userAddress } : undefined,
		onLogs: (logs) => {
			console.log('Token transfer (to user) detected:', logs);
			queryClient.invalidateQueries({ queryKey: ['balance'] });
		},
		enabled: enabled && tokenAddresses.length > 0 && !!userAddress,
	});

	// Watch for ERC20 Approval events
	useWatchContractEvent({
		address: tokenAddresses,
		abi: ERC20_ABI,
		eventName: 'Approval',
		args: userAddress ? { owner: userAddress } : undefined,
		onLogs: (logs) => {
			console.log('Token approval event detected:', logs);
			queryClient.invalidateQueries({ queryKey: ['readContract'] });
		},
		enabled: enabled && tokenAddresses.length > 0 && !!userAddress,
	});

	// Auto-refresh data periodically as fallback
	useEffect(() => {
		if (!enabled) return;

		const interval = setInterval(() => {
			// Refresh critical data every 30 seconds as fallback
			queryClient.invalidateQueries({
				queryKey: ['readContract'],
				stale: true, // Only invalidate if data is stale
			});
		}, 30000);

		return () => clearInterval(interval);
	}, [enabled, queryClient]);

	return {
		invalidateMarketData: () => {
			queryClient.invalidateQueries({ queryKey: ['readContract'] });
			queryClient.invalidateQueries({ queryKey: ['balance'] });
			queryClient.invalidateQueries({ queryKey: ['marketData'] });
		},
	};
}
