import { useReadContract, useChainId, useAccount } from 'wagmi';
import { useMemo } from 'react';
import type { Address } from 'viem';
import { LENS_ABI, getLensAddress, getComptrollerAddress } from '../contracts';
import { MARKET_QUERY_CONFIG } from './market-query.constants';

export interface AccountLimitsData {
	markets: Address[];
	liquidity: bigint;
	shortfall: bigint;
}

/**
 * Enhanced account liquidity hook using Lens contract's getAccountLimits
 * Combines account liquidity + user markets in a single call
 *
 * Benefits:
 * - Single RPC call instead of separate getAccountLiquidity + getAssetsIn calls
 * - 50% reduction in account-related RPC calls
 * - Includes user's entered markets as bonus data
 */
export function useAccountLiquidityEnhanced(userAddress?: Address) {
	const chainId = useChainId();
	const { address: connectedAddress } = useAccount();
	const effectiveAddress = userAddress || connectedAddress;

	const {
		data: lensResult,
		isLoading,
		error,
	} = useReadContract({
		address: getLensAddress(chainId),
		abi: LENS_ABI,
		functionName: 'getAccountLimits',
		args: effectiveAddress ? [getComptrollerAddress(chainId), effectiveAddress] : undefined,
		query: {
			enabled: !!effectiveAddress,
			...MARKET_QUERY_CONFIG.ACCOUNT_LIQUIDITY,
		},
	});

	const processedData = useMemo(() => {
		if (!lensResult || !effectiveAddress) {
			return {
				liquidity: 0n,
				shortfall: 0n,
				userMarkets: [],
				isHealthy: true,
				liquidationRisk: 0, // 0-100 percentage
				hasCollateral: false,
			};
		}

		const result = lensResult as AccountLimitsData;
		const isHealthy = result.shortfall === 0n;
		const hasCollateral = result.markets.length > 0;

		// Calculate liquidation risk percentage (basic formula)
		let liquidationRisk = 0;
		if (result.liquidity > 0n || result.shortfall > 0n) {
			const totalAccountValue = result.liquidity + result.shortfall;
			if (totalAccountValue > 0n) {
				liquidationRisk = Number((result.shortfall * 100n) / totalAccountValue);
			}
		}

		return {
			liquidity: result.liquidity,
			shortfall: result.shortfall,
			userMarkets: result.markets,
			isHealthy,
			liquidationRisk: Math.min(100, Math.max(0, liquidationRisk)),
			hasCollateral,
		};
	}, [lensResult, effectiveAddress]);

	return {
		data: processedData,
		// Legacy compatibility - destructured values for easy migration
		liquidity: processedData.liquidity,
		shortfall: processedData.shortfall,
		userMarkets: processedData.userMarkets,
		isHealthy: processedData.isHealthy,
		liquidationRisk: processedData.liquidationRisk,
		hasCollateral: processedData.hasCollateral,
		isLoading,
		error,
	};
}

/**
 * Get only the account liquidity data (backwards compatible)
 */
export function useAccountLiquidityOnly(userAddress?: Address) {
	const { liquidity, shortfall, isHealthy, isLoading, error } = useAccountLiquidityEnhanced(userAddress);

	return {
		data: {
			liquidity,
			shortfall,
			isHealthy,
		},
		isLoading,
		error,
	};
}

/**
 * Get only the user's entered markets (backwards compatible)
 */
export function useUserMarketsOnly(userAddress?: Address) {
	const { userMarkets, isLoading, error } = useAccountLiquidityEnhanced(userAddress);

	return {
		data: userMarkets,
		isLoading,
		error,
	};
}
