import { useReadContract, useReadContracts, useChainId } from 'wagmi';
import type { Address } from 'viem';
import { COMPTROLLER_ABI, CTOKEN_ABI, getComptrollerAddress } from '../contracts';
import { MARKET_QUERY_CONFIG } from './market-query.constants';

/**
 * Hook to fetch all available markets from the Comptroller
 */
export function useAllMarkets() {
	const chainId = useChainId();

	return useReadContract({
		address: getComptrollerAddress(chainId),
		abi: COMPTROLLER_ABI,
		functionName: 'getAllMarkets',
		query: MARKET_QUERY_CONFIG.MARKET_INFO,
	});
}

/**
 * Hook to fetch market information for a specific CToken
 */
export function useMarket(marketAddress: Address) {
	const chainId = useChainId();

	return useReadContracts({
		contracts: [
			{
				address: getComptrollerAddress(chainId),
				abi: COMPTROLLER_ABI,
				functionName: 'markets',
				args: [marketAddress],
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'name',
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'symbol',
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'underlying',
			},
		],
		query: {
			staleTime: MARKET_QUERY_CONFIG.MARKET_INFO.staleTime,
		},
	});
}

/**
 * Hook to fetch detailed market data including rates and balances
 */
export function useMarketData(marketAddress: Address) {
	return useReadContracts({
		contracts: [
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'supplyRatePerBlock',
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'borrowRatePerBlock',
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'totalSupply',
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'totalBorrows',
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'exchangeRateStored',
			},
		],
		query: MARKET_QUERY_CONFIG.MARKET_RATES,
	});
}

/**
 * Hook to fetch markets that the user has entered (for collateral)
 */
export function useUserMarkets(userAddress?: Address) {
	const chainId = useChainId();

	const result = useReadContract({
		address: getComptrollerAddress(chainId),
		abi: COMPTROLLER_ABI,
		functionName: 'getAssetsIn',
		args: userAddress ? [userAddress] : undefined,
		query: {
			enabled: !!userAddress,
			...MARKET_QUERY_CONFIG.ACCOUNT_LIQUIDITY,
		},
	});

	return {
		...result,
		queryKey: result.queryKey,
	};
}

/**
 * Combined hook to get all markets with their data
 */
export function useMarketsWithData() {
	const { data: marketAddresses, isLoading: marketsLoading, error: marketsError } = useAllMarkets();

	return {
		data: marketAddresses,
		isLoading: marketsLoading,
		error: marketsError,
	};
}
