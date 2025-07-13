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

	useWatchContractEvent({
		address: marketAddresses,
		abi: CTOKEN_ABI,
		eventName: 'Mint',
		args: userAddress ? { minter: userAddress } : undefined,
		onLogs: () => {
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
		onLogs: () => {
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
		onLogs: () => {
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
		onLogs: () => {
			queryClient.invalidateQueries({ queryKey: ['readContract'] });
			queryClient.invalidateQueries({ queryKey: ['balance'] });
			queryClient.invalidateQueries({ queryKey: ['marketData'] });
		},
		enabled: enabled && marketAddresses.length > 0 && !!userAddress,
	});

	useWatchContractEvent({
		address: tokenAddresses,
		abi: ERC20_ABI,
		eventName: 'Transfer',
		args: userAddress ? { from: userAddress } : undefined,
		onLogs: () => {
			queryClient.invalidateQueries({ queryKey: ['balance'] });
		},
		enabled: enabled && tokenAddresses.length > 0 && !!userAddress,
	});

	useWatchContractEvent({
		address: tokenAddresses,
		abi: ERC20_ABI,
		eventName: 'Transfer',
		args: userAddress ? { to: userAddress } : undefined,
		onLogs: () => {
			queryClient.invalidateQueries({ queryKey: ['balance'] });
		},
		enabled: enabled && tokenAddresses.length > 0 && !!userAddress,
	});

	useWatchContractEvent({
		address: tokenAddresses,
		abi: ERC20_ABI,
		eventName: 'Approval',
		args: userAddress ? { owner: userAddress } : undefined,
		onLogs: () => {
			queryClient.invalidateQueries({ queryKey: ['readContract'] });
		},
		enabled: enabled && tokenAddresses.length > 0 && !!userAddress,
	});

	useEffect(() => {
		if (!enabled) return;

		const interval = setInterval(() => {
			queryClient.invalidateQueries({
				queryKey: ['readContract'],
				stale: true,
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
