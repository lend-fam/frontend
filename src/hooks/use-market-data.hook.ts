import { useReadContracts, useChainId } from 'wagmi';
import { useMemo } from 'react';
import type { Address } from 'viem';
import { COMPTROLLER_ABI, CTOKEN_ABI, getComptrollerAddress } from '../contracts';
import { MarketService } from '../services/market.service';
import { useAllMarkets } from './use-market-core.hook';
import { MARKET_QUERY_CONFIG } from './market-query.constants';

/**
 * Hook to fetch available liquidity for borrowing in all markets
 */
export function useMarketsAvailableLiquidity() {
	const { data: marketAddresses, isLoading: marketsLoading } = useAllMarkets();

	const liquidityContracts =
		marketAddresses?.map((address: Address) => ({
			address,
			abi: CTOKEN_ABI,
			functionName: 'getCash',
		})) || [];

	const { data: contractResults, isLoading: dataLoading } = useReadContracts({
		contracts: liquidityContracts,
		query: {
			enabled: !!marketAddresses && marketAddresses.length > 0,
			...MARKET_QUERY_CONFIG.MARKET_LIQUIDITY,
		},
	});

	const processedData = useMemo(() => {
		if (!marketAddresses || !contractResults) return {};

		const liquidityData: Record<Address, bigint> = {};

		marketAddresses.forEach((address: Address, index: number) => {
			const liquidityResult = contractResults[index];
			const availableLiquidity = liquidityResult?.result ? (liquidityResult.result as bigint) : 0n;
			liquidityData[address] = availableLiquidity;
		});

		return liquidityData;
	}, [marketAddresses, contractResults]);

	return {
		data: processedData,
		isLoading: marketsLoading || dataLoading,
	};
}

/**
 * Hook to fetch APY data for all markets
 */
export function useMarketsAPY() {
	const { data: marketAddresses, isLoading: marketsLoading } = useAllMarkets();

	const marketDataContracts =
		marketAddresses?.flatMap((address: Address) => [
			{
				address,
				abi: CTOKEN_ABI,
				functionName: 'supplyRatePerBlock',
			},
			{
				address,
				abi: CTOKEN_ABI,
				functionName: 'borrowRatePerBlock',
			},
		]) || [];

	const { data: contractResults, isLoading: dataLoading } = useReadContracts({
		contracts: marketDataContracts,
		query: {
			enabled: !!marketAddresses && marketAddresses.length > 0,
			...MARKET_QUERY_CONFIG.MARKET_RATES,
		},
	});

	const processedData = useMemo(() => {
		if (!marketAddresses || !contractResults) return {};

		const apyData: Record<Address, { supplyAPY: string; borrowAPY: string }> = {};

		marketAddresses.forEach((address: Address, index: number) => {
			const supplyRateResult = contractResults[index * 2];
			const borrowRateResult = contractResults[index * 2 + 1];

			const supplyAPY = supplyRateResult?.result
				? MarketService.calculateSupplyAPY(supplyRateResult.result as bigint)
				: '0.00';

			const borrowAPY = borrowRateResult?.result
				? MarketService.calculateBorrowAPY(borrowRateResult.result as bigint)
				: '0.00';

			apyData[address] = { supplyAPY, borrowAPY };
		});

		return apyData;
	}, [marketAddresses, contractResults]);

	return {
		data: processedData,
		isLoading: marketsLoading || dataLoading,
	};
}

/**
 * Hook to fetch exchange rates for all markets
 */
export function useMarketsExchangeRates() {
	const { data: marketAddresses, isLoading: marketsLoading } = useAllMarkets();

	const exchangeRateContracts =
		marketAddresses?.map((address: Address) => ({
			address,
			abi: CTOKEN_ABI,
			functionName: 'exchangeRateStored',
		})) || [];

	const { data: contractResults, isLoading: dataLoading } = useReadContracts({
		contracts: exchangeRateContracts,
		query: {
			enabled: !!marketAddresses && marketAddresses.length > 0,
			...MARKET_QUERY_CONFIG.MARKET_RATES,
		},
	});

	const processedData = useMemo(() => {
		if (!marketAddresses || !contractResults) return {};

		const exchangeRateData: Record<Address, bigint> = {};

		marketAddresses.forEach((address: Address, index: number) => {
			const exchangeRateResult = contractResults[index];
			const exchangeRate = exchangeRateResult?.result ? (exchangeRateResult.result as bigint) : 0n;

			exchangeRateData[address] = exchangeRate;
		});

		return exchangeRateData;
	}, [marketAddresses, contractResults]);

	return {
		data: processedData,
		isLoading: marketsLoading || dataLoading,
	};
}

/**
 * Hook to fetch collateral factors for all markets
 */
export function useMarketsCollateralFactors() {
	const chainId = useChainId();
	const { data: marketAddresses, isLoading: marketsLoading } = useAllMarkets();

	const collateralFactorContracts =
		marketAddresses?.map((address: Address) => ({
			address: getComptrollerAddress(chainId),
			abi: COMPTROLLER_ABI,
			functionName: 'markets',
			args: [address],
		})) || [];

	const { data: contractResults, isLoading: dataLoading } = useReadContracts({
		contracts: collateralFactorContracts,
		query: {
			enabled: !!marketAddresses && marketAddresses.length > 0,
			...MARKET_QUERY_CONFIG.MARKET_INFO,
		},
	});

	const processedData = useMemo(() => {
		if (!marketAddresses || !contractResults) return {};

		const collateralFactorData: Record<Address, number> = {};

		marketAddresses.forEach((address: Address, index: number) => {
			const marketResult = contractResults[index];
			if (marketResult?.result) {
				const marketData = marketResult.result as unknown;
				if (Array.isArray(marketData) && marketData.length >= 2) {
					const [, collateralFactorMantissa] = marketData as [boolean, bigint, boolean];
					const collateralFactor = Number(collateralFactorMantissa) / 1e18;
					collateralFactorData[address] = collateralFactor;
				}
			}
		});

		return collateralFactorData;
	}, [marketAddresses, contractResults]);

	return {
		data: processedData,
		isLoading: marketsLoading || dataLoading,
	};
}