import { formatUnits, type Address } from 'viem';
import { useReadContract, useReadContracts, useChainId } from 'wagmi';
import { COMPTROLLER_ABI, PRICE_ORACLE_ABI, getComptrollerAddress } from '../contracts';
import { FormattingService } from './formatting.service';
import { FALLBACK_PRICES, FORMATTING_THRESHOLDS } from '../constants';

export function usePriceOracle() {
	const chainId = useChainId();

	return useReadContract({
		address: getComptrollerAddress(chainId),
		abi: COMPTROLLER_ABI,
		functionName: 'oracle',
		query: {
			staleTime: 5 * 60 * 1000,
		},
	});
}

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
