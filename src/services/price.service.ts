import { formatUnits, type Address } from 'viem';
import { useReadContract, useReadContracts, useChainId } from 'wagmi';
import { COMPTROLLER_ABI, PRICE_ORACLE_ABI, getComptrollerAddress } from '../contracts';

/**
 * Hook to get the price oracle address from Comptroller
 */
export function usePriceOracle() {
	const chainId = useChainId();

	return useReadContract({
		address: getComptrollerAddress(chainId),
		abi: COMPTROLLER_ABI,
		functionName: 'oracle',
		query: {
			staleTime: 5 * 60 * 1000, // Cache for 5 minutes
		},
	});
}

/**
 * Hook to fetch token prices from Compound's price oracle
 */
export function useTokenPrices(marketAddresses: Address[]) {
	const { data: oracleAddress } = usePriceOracle();

	const priceContracts = marketAddresses.map((marketAddress) => ({
		address: oracleAddress as Address,
		abi: PRICE_ORACLE_ABI,
		functionName: 'getUnderlyingPrice',
		args: [marketAddress],
	}));

	return useReadContracts({
		contracts: priceContracts,
		query: {
			enabled: !!oracleAddress && marketAddresses.length > 0,
			staleTime: 30000, // Cache for 30 seconds (prices change frequently)
			refetchInterval: 30000,
		},
	});
}

export class PriceService {
	/**
	 * Get fallback price for a token symbol (in USD)
	 */
	static getFallbackPrice(symbol: string): number {
		const normalizedSymbol = symbol.toUpperCase();

		// Fallback prices for common tokens
		const fallbackPrices: Record<string, number> = {
			MDAI: 1.0, // Assume $1 for DAI derivative
			MUSDC: 1.0, // Assume $1 for USDC derivative
			MUSDT: 1.0, // Assume $1 for USDT derivative
			DAI: 1.0,
			USDC: 1.0,
			USDT: 1.0,
			ETH: 3000, // Rough ETH price
			WETH: 3000,
		};

		return fallbackPrices[normalizedSymbol] || 1.0; // Default to $1
	}

	/**
	 * Calculate USD value using fallback price
	 */
	static calculateUSDValueWithFallback(balance: bigint, decimals: number, fallbackPrice: number): string {
		try {
			const tokenAmount = formatUnits(balance, decimals);
			const usdValue = parseFloat(tokenAmount) * fallbackPrice;

			if (isNaN(usdValue)) {
				return '0';
			}

			return usdValue.toFixed(2);
		} catch {
			return '0';
		}
	}

	/**
	 * Convert a token balance to USD value using oracle price
	 * @param balance - Token balance in wei
	 * @param decimals - Token decimals
	 * @param oraclePrice - Price from oracle (scaled by 1e18)
	 */
	static calculateUSDValue(balance: bigint, decimals: number, oraclePrice: bigint): string {
		try {
			const tokenAmount = formatUnits(balance, decimals);
			const priceInUSD = formatUnits(oraclePrice, 18);

			const usdValue = parseFloat(tokenAmount) * parseFloat(priceInUSD);

			if (isNaN(usdValue)) {
				return '0';
			}

			return usdValue.toFixed(2);
		} catch {
			return '0';
		}
	}
}
