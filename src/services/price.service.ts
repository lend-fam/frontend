import { formatUnits, type Address } from 'viem';
import { useReadContracts, useChainId } from 'wagmi';
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
			enabled: !!oracleAddress && marketAddresses.length > 0,
			staleTime: 30000,
			refetchInterval: 30000,
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
}
