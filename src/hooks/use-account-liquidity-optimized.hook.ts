import { useReadContract, useChainId } from 'wagmi';
import type { Address } from 'viem';
import { LENS_ABI, getLensAddress, getComptrollerAddress } from '../contracts';
import { MARKET_QUERY_CONFIG } from './market-query.constants';

export interface AccountLimits {
	markets: Address[];
	liquidity: bigint;
	shortfall: bigint;
}

/**
 * Optimized hook using Lens contract to fetch account liquidity and limits
 * Provides more comprehensive data than the basic comptroller call
 */
export function useAccountLiquidityOptimized(userAddress?: Address) {
	const chainId = useChainId();

	return useReadContract({
		address: getLensAddress(chainId),
		abi: LENS_ABI,
		functionName: 'getAccountLimits',
		args: userAddress ? [getComptrollerAddress(chainId), userAddress] : undefined,
		query: {
			enabled: !!userAddress,
			...MARKET_QUERY_CONFIG.ACCOUNT_LIQUIDITY,
		},
	});
}
