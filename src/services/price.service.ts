import { formatUnits, type Address } from 'viem';
import { useReadContracts, useChainId, useReadContract } from 'wagmi';
import { PRICE_ORACLE_ABI } from '../contracts';
import { FormattingService } from './formatting.service';
import { FALLBACK_PRICES, FORMATTING_THRESHOLDS } from '../constants';
import { useTypedOracleAddress } from '../hooks/use-typed-contracts';

export function usePriceOracle() {
	const chainId = useChainId();
	return useTypedOracleAddress(chainId);
}

export function useTokenPrices(marketAddresses: Address[]) {
	const { data: oracleAddress } = usePriceOracle();

	const priceContracts = marketAddresses.map((marketAddress) => ({
		address: oracleAddress!,
		abi: PRICE_ORACLE_ABI,
		functionName: 'getUnderlyingPrice',
		args: [marketAddress],
	}));

	return useReadContracts({
		contracts: priceContracts,
		query: {
			enabled: Boolean(oracleAddress) && marketAddresses.length > 0,
			staleTime: 30000,
			refetchInterval: 30000,
			retry: 3,
			refetchOnMount: true,
			refetchOnWindowFocus: false,
		},
	});
}

// Pyth oracle specific hooks
export function usePythOracleInfo() {
	const { data: oracleAddress } = usePriceOracle();

	const contracts = [
		{
			address: oracleAddress!,
			abi: PRICE_ORACLE_ABI,
			functionName: 'pyth',
		},
		{
			address: oracleAddress!,
			abi: PRICE_ORACLE_ABI,
			functionName: 'admin',
		},
		{
			address: oracleAddress!,
			abi: PRICE_ORACLE_ABI,
			functionName: 'maxPriceAge',
		},
	];

	return useReadContracts({
		contracts,
		query: {
			enabled: !!oracleAddress,
			staleTime: 60000, // Less frequent updates for config data
		},
	});
}

export function usePythPriceFeedId(assetAddress: Address) {
	const { data: oracleAddress } = usePriceOracle();

	return useReadContract({
		address: oracleAddress!,
		abi: PRICE_ORACLE_ABI,
		functionName: 'assetToPriceFeedId',
		args: [assetAddress],
		query: {
			enabled: !!oracleAddress && !!assetAddress,
			staleTime: 300000, // Very stable data
		},
	});
}

export function usePythPriceFeedHealth(priceFeedId: string) {
	const { data: oracleAddress } = usePriceOracle();

	return useReadContract({
		address: oracleAddress!,
		abi: PRICE_ORACLE_ABI,
		functionName: 'canGetPythPrice',
		args: [priceFeedId as `0x${string}`],
		query: {
			enabled:
				!!oracleAddress &&
				!!priceFeedId &&
				priceFeedId !== '0x0000000000000000000000000000000000000000000000000000000000000000',
			staleTime: 10000, // Check health frequently
			refetchInterval: 30000,
		},
	});
}

export function useAssetFallbackInfo(assetAddress: Address) {
	const { data: oracleAddress } = usePriceOracle();

	const contracts = [
		{
			address: oracleAddress!,
			abi: PRICE_ORACLE_ABI,
			functionName: 'fallbackPrices',
			args: [assetAddress],
		},
		{
			address: oracleAddress!,
			abi: PRICE_ORACLE_ABI,
			functionName: 'useFallbackPrice',
			args: [assetAddress],
		},
	];

	return useReadContracts({
		contracts,
		query: {
			enabled: !!oracleAddress && !!assetAddress,
			staleTime: 60000,
		},
	});
}

export class PriceService {
	static getFallbackPrice(symbol: string): number {
		const normalizedSymbol = symbol.toUpperCase();
		return FALLBACK_PRICES[normalizedSymbol as keyof typeof FALLBACK_PRICES] || 1.0;
	}

	static calculateUSDValueWithFallback(balance: bigint, decimals: number, fallbackPrice: number): string {
		try {
			const tokenAmount = formatUnits(balance, decimals);
			const usdValue = parseFloat(tokenAmount) * fallbackPrice;

			if (isNaN(usdValue)) {
				return '0';
			}

			return usdValue.toFixed(FORMATTING_THRESHOLDS.CURRENCY_DECIMALS);
		} catch {
			return '0';
		}
	}

	static calculateUSDValue(balance: bigint, decimals: number, oraclePrice: bigint): string {
		try {
			const tokenAmount = formatUnits(balance, decimals);
			const priceInUSD = formatUnits(oraclePrice, FORMATTING_THRESHOLDS.DEFAULT_DECIMALS);

			const usdValue = parseFloat(tokenAmount) * parseFloat(priceInUSD);

			if (isNaN(usdValue)) {
				return '0';
			}

			return usdValue.toFixed(FORMATTING_THRESHOLDS.CURRENCY_DECIMALS);
		} catch {
			return '0';
		}
	}

	static formatUSDValue(value: string): string {
		return FormattingService.formatUSDValue(value);
	}

	// Pyth oracle specific utilities
	static isPythOracle(): Promise<boolean> {
		// This would be called externally with contract read to check if oracle has pyth() function
		return Promise.resolve(false);
	}

	static formatPriceFeedId(priceFeedId: string): string {
		if (!priceFeedId || priceFeedId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
			return 'Not configured';
		}
		return `${priceFeedId.slice(0, 10)}...${priceFeedId.slice(-8)}`;
	}

	static formatMaxPriceAge(maxAgeSeconds: bigint): string {
		const seconds = Number(maxAgeSeconds);
		if (seconds < 60) return `${seconds}s`;
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
		if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
		return `${Math.floor(seconds / 86400)}d`;
	}

	static getPriceSourceLabel(useFallback: boolean, priceFeedId?: string, canGetPythPrice?: boolean): string {
		if (!priceFeedId || priceFeedId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
			return 'Fallback Only';
		}

		if (useFallback) {
			return 'Fallback (Forced)';
		}

		if (canGetPythPrice === false) {
			return 'Fallback (Pyth Unavailable)';
		}

		if (canGetPythPrice === true) {
			return 'Pyth Network';
		}

		return 'Unknown';
	}

	static calculatePriceWithSource(
		oraclePrice: bigint | undefined,
		fallbackPrice: bigint | undefined,
		useFallbackForced: boolean,
		pythAvailable: boolean,
	): { price: bigint; source: 'pyth' | 'fallback' | 'unavailable' } {
		// If fallback is forced, use fallback
		if (useFallbackForced && fallbackPrice) {
			return { price: fallbackPrice, source: 'fallback' };
		}

		// If Pyth is available and we have oracle price, use it
		if (pythAvailable && oraclePrice && oraclePrice > 0n) {
			return { price: oraclePrice, source: 'pyth' };
		}

		// Fall back to fallback price
		if (fallbackPrice && fallbackPrice > 0n) {
			return { price: fallbackPrice, source: 'fallback' };
		}

		// No price available
		return { price: 0n, source: 'unavailable' };
	}
}
