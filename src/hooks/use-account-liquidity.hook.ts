import { useReadContract, useChainId } from 'wagmi';
import type { Address } from 'viem';
import { COMPTROLLER_ABI, getComptrollerAddress } from '../contracts';
import { MARKET_QUERY_CONFIG } from './market-query.constants';

/**
 * Hook to fetch user's account liquidity
 */
export function useAccountLiquidity(userAddress?: Address) {
	const chainId = useChainId();

	return useReadContract({
		address: getComptrollerAddress(chainId),
		abi: COMPTROLLER_ABI,
		functionName: 'getAccountLiquidity',
		args: userAddress ? [userAddress] : undefined,
		query: {
			enabled: !!userAddress,
			...MARKET_QUERY_CONFIG.ACCOUNT_LIQUIDITY,
		},
	});
}