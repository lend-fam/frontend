import { useReadContracts } from 'wagmi';
import { useMemo } from 'react';
import type { Address } from 'viem';
import { CTOKEN_ABI } from '../contracts';
import { useAllMarkets } from './use-market-core.hook';
import { MARKET_QUERY_CONFIG } from './market-query.constants';

/**
 * Hook to fetch user's position in a specific market
 */
export function useUserMarketPosition(marketAddress: Address, userAddress?: Address) {
	return useReadContracts({
		contracts: [
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'balanceOf',
				args: userAddress ? [userAddress] : undefined,
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'borrowBalanceStored',
				args: userAddress ? [userAddress] : undefined,
			},
		],
		query: {
			enabled: !!userAddress,
			...MARKET_QUERY_CONFIG.USER_POSITIONS,
		},
	});
}

/**
 * Hook to fetch user supply positions for all markets
 */
export function useUserSupplyPositions(userAddress?: Address) {
	const { data: marketAddresses, isLoading: marketsLoading } = useAllMarkets();

	const marketBalanceContracts =
		marketAddresses?.map((address: Address) => ({
			address,
			abi: CTOKEN_ABI,
			functionName: 'balanceOfUnderlying',
			args: userAddress ? [userAddress] : undefined,
		})) || [];

	const { data: contractResults, isLoading: dataLoading } = useReadContracts({
		contracts: marketBalanceContracts,
		query: {
			enabled: !!userAddress && !!marketAddresses && marketAddresses.length > 0,
			staleTime: MARKET_QUERY_CONFIG.USER_POSITIONS.staleTime,
			refetchInterval: false,
		},
	});

	const processedData = useMemo(() => {
		if (!marketAddresses || !contractResults || !userAddress) return {};

		const positionData: Record<Address, { balance: bigint; hasSupplied: boolean }> = {};

		marketAddresses.forEach((address: Address, index: number) => {
			const balanceResult = contractResults[index];
			const balance = balanceResult?.result ? (balanceResult.result as bigint) : 0n;

			// Consider amounts less than 1000 wei as dust (effectively zero)
			const dustThreshold = 1000n;
			const hasSupplied = balance > dustThreshold;

			positionData[address] = {
				balance,
				hasSupplied,
			};
		});

		return positionData;
	}, [marketAddresses, contractResults, userAddress]);

	return {
		data: processedData,
		isLoading: marketsLoading || dataLoading,
	};
}

/**
 * Hook to fetch user borrow positions for all markets
 */
export function useUserBorrowPositions(userAddress?: Address) {
	const { data: marketAddresses, isLoading: marketsLoading } = useAllMarkets();

	const marketBorrowContracts =
		marketAddresses?.map((address: Address) => ({
			address,
			abi: CTOKEN_ABI,
			functionName: 'borrowBalanceStored',
			args: userAddress ? [userAddress] : undefined,
		})) || [];

	const { data: contractResults, isLoading: dataLoading } = useReadContracts({
		contracts: marketBorrowContracts,
		query: {
			enabled: !!userAddress && !!marketAddresses && marketAddresses.length > 0,
			staleTime: MARKET_QUERY_CONFIG.USER_POSITIONS.staleTime,
			refetchInterval: false,
		},
	});

	const processedData = useMemo(() => {
		if (!marketAddresses || !contractResults || !userAddress) return {};

		const positionData: Record<Address, { balance: bigint; hasBorrowed: boolean }> = {};

		marketAddresses.forEach((address: Address, index: number) => {
			const balanceResult = contractResults[index];
			const balance = balanceResult?.result ? (balanceResult.result as bigint) : 0n;

			// Consider amounts less than 1000 wei as dust (effectively zero)
			const dustThreshold = 1000n;
			const hasBorrowed = balance > dustThreshold;

			positionData[address] = {
				balance,
				hasBorrowed,
			};
		});

		return positionData;
	}, [marketAddresses, contractResults, userAddress]);

	return {
		data: processedData,
		isLoading: marketsLoading || dataLoading,
	};
}
