import { useMemo } from 'react';
import type { Address } from 'viem';
import { useTokenPrices, PriceService } from '../services/price.service';

interface TokenBalance {
	marketAddress: Address;
	balance: bigint;
	symbol: string;
	decimals: number;
}

/**
 * Hook to fetch USD values for token balances using Compound's price oracle
 */
export function useUSDBalances(balances: TokenBalance[]): {
	data: Record<Address, string>;
	isLoading: boolean;
	error: string | null;
} {
	// Extract market addresses for price fetching
	const marketAddresses = useMemo(() => balances.map((b) => b.marketAddress), [balances]);

	// Fetch prices from Compound oracle
	const { data: priceResults, isLoading, error } = useTokenPrices(marketAddresses);

	// Log only when there are oracle failures for debugging
	if (error) {
		console.warn('Price oracle error:', error);
	}

	// Calculate USD values
	const usdValues = useMemo(() => {
		if (!priceResults || isLoading) return {};

		const result: Record<Address, string> = {};

		balances.forEach((balance, index) => {
			const priceResult = priceResults[index];

			if (priceResult?.status === 'success' && priceResult.result && balance.balance > 0n) {
				const oraclePrice = priceResult.result as unknown as bigint;

				// If oracle price is 0, use fallback pricing
				if (oraclePrice === 0n) {
					const fallbackPrice = PriceService.getFallbackPrice(balance.symbol);
					const usdValue = PriceService.calculateUSDValueWithFallback(
						balance.balance,
						balance.decimals,
						fallbackPrice,
					);
					result[balance.marketAddress] = usdValue;
				} else {
					const usdValue = PriceService.calculateUSDValue(balance.balance, balance.decimals, oraclePrice);
					result[balance.marketAddress] = usdValue;
				}
			} else {
				// Use fallback pricing when oracle fails
				const fallbackPrice = PriceService.getFallbackPrice(balance.symbol);
				const usdValue = PriceService.calculateUSDValueWithFallback(
					balance.balance,
					balance.decimals,
					fallbackPrice,
				);
				result[balance.marketAddress] = usdValue;
			}
		});

		return result;
	}, [balances, priceResults, isLoading]);

	return {
		data: usdValues,
		isLoading,
		error: error ? 'Failed to fetch prices from oracle' : null,
	};
}

/**
 * Hook to get USD value for a single token balance
 */
export function useUSDBalance(
	marketAddress: Address,
	balance: bigint,
	symbol: string,
	decimals: number = 18,
): {
	usdValue: string;
	isLoading: boolean;
	error: string | null;
} {
	const balances = useMemo(
		() => (balance > 0n ? [{ marketAddress, balance, symbol, decimals }] : []),
		[marketAddress, balance, symbol, decimals],
	);

	const { data, isLoading, error } = useUSDBalances(balances);

	return {
		usdValue: data[marketAddress] || '0',
		isLoading,
		error,
	};
}
