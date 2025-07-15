import { useReadContract, useChainId } from 'wagmi';
import { useMemo } from 'react';
import type { Address } from 'viem';
import { LENS_ABI, getLensAddress } from '../contracts';
import { MarketService } from '../services/market.service';
import { useAllMarkets } from './use-market-core.hook';
import { MARKET_QUERY_CONFIG } from './market-query.constants';

export interface CTokenMetadata {
	cToken: Address;
	exchangeRateCurrent: bigint;
	supplyRatePerBlock: bigint;
	borrowRatePerBlock: bigint;
	reserveFactorMantissa: bigint;
	totalBorrows: bigint;
	totalReserves: bigint;
	totalSupply: bigint;
	totalCash: bigint;
	isListed: boolean;
	collateralFactorMantissa: bigint;
	underlyingAssetAddress: Address;
	cTokenDecimals: bigint;
	underlyingDecimals: bigint;
}

/**
 * Optimized hook using Lens contract to fetch all market data in a single call
 * Replaces multiple individual hooks: useMarketsAPY, useMarketsExchangeRates,
 * useMarketsCollateralFactors, useMarketsAvailableLiquidity
 */
export function useMarketsDataOptimized() {
	const chainId = useChainId();
	const { data: marketAddresses, isLoading: marketsLoading } = useAllMarkets();

	const { data: lensResult, isLoading: lensLoading } = useReadContract({
		address: getLensAddress(chainId),
		abi: LENS_ABI,
		functionName: 'cTokenMetadataAll',
		args: marketAddresses ? [marketAddresses] : undefined,
		query: {
			enabled: !!marketAddresses && marketAddresses.length > 0,
			...MARKET_QUERY_CONFIG.MARKET_INFO,
		},
	});

	const processedData = useMemo(() => {
		if (!marketAddresses || !lensResult) {
			return {
				apyData: {},
				exchangeRateData: {},
				collateralFactorData: {},
				liquidityData: {},
				marketMetadata: {},
			};
		}

		const apyData: Record<Address, { supplyAPY: string; borrowAPY: string }> = {};
		const exchangeRateData: Record<Address, bigint> = {};
		const collateralFactorData: Record<Address, number> = {};
		const liquidityData: Record<Address, bigint> = {};
		const marketMetadata: Record<Address, CTokenMetadata> = {};

		(lensResult as CTokenMetadata[]).forEach((metadata) => {
			const address = metadata.cToken;

			// APY calculations
			const supplyAPY = MarketService.calculateSupplyAPY(metadata.supplyRatePerBlock);
			const borrowAPY = MarketService.calculateBorrowAPY(metadata.borrowRatePerBlock);
			apyData[address] = { supplyAPY, borrowAPY };

			// Exchange rates
			exchangeRateData[address] = metadata.exchangeRateCurrent;

			// Collateral factors
			collateralFactorData[address] = Number(metadata.collateralFactorMantissa) / 1e18;

			// Available liquidity (total cash)
			liquidityData[address] = metadata.totalCash;

			// Complete metadata
			marketMetadata[address] = metadata;
		});

		return {
			apyData,
			exchangeRateData,
			collateralFactorData,
			liquidityData,
			marketMetadata,
		};
	}, [marketAddresses, lensResult]);

	return {
		data: processedData,
		isLoading: marketsLoading || lensLoading,
	};
}

/**
 * Individual hooks for backward compatibility
 */
export function useMarketsAPYOptimized() {
	const { data, isLoading } = useMarketsDataOptimized();
	return {
		data: data.apyData,
		isLoading,
	};
}

export function useMarketsExchangeRatesOptimized() {
	const { data, isLoading } = useMarketsDataOptimized();
	return {
		data: data.exchangeRateData,
		isLoading,
	};
}

export function useMarketsCollateralFactorsOptimized() {
	const { data, isLoading } = useMarketsDataOptimized();
	return {
		data: data.collateralFactorData,
		isLoading,
	};
}

export function useMarketsAvailableLiquidityOptimized() {
	const { data, isLoading } = useMarketsDataOptimized();
	return {
		data: data.liquidityData,
		isLoading,
	};
}
