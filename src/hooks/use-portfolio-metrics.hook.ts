import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';
import { useAccountLiquidity } from './use-account-liquidity.hook';
import { useUserSupplyPositions, useUserBorrowPositions } from './use-user-positions.hook';
import { useMarketsAPY, useMarketsCollateralFactors } from './use-market-data.hook';
import { useTokenPrices, PriceService } from '../services/price.service';
import { HealthFactorService, type PositionData } from '../services/health-factor.service';
import { useNativeYield } from './use-native-yield.hook';
import { NativeYieldService } from '../services/native-yield.service';
import { useTokenMetadata } from './use-token-metadata.hook';

export interface PortfolioMetrics {
	netAPY: string;
	healthFactor: string;
	borrowUsage: string;
	cumulativeLTV: string;
	totalSuppliedUSD: number;
	totalBorrowedUSD: number;
	availableBorrowUSD: number;
	nativeYield: {
		apy: string;
		yieldMode: string;
		isEnabled: boolean;
		apeBalance: string;
		estimatedDailyYield: string;
		estimatedMonthlyYield: string;
		comparison: {
			better: 'native' | 'lending' | 'equal';
			difference: string;
		} | null;
	};
}

export function usePortfolioMetrics(): {
	data: PortfolioMetrics | null;
	isLoading: boolean;
} {
	const { address } = useAccount();

	const { data: supplyPositions, isLoading: supplyLoading } = useUserSupplyPositions(address);
	const { data: borrowPositions, isLoading: borrowLoading } = useUserBorrowPositions(address);
	const { data: accountLiquidity, isLoading: liquidityLoading } = useAccountLiquidity(address);
	const { data: marketsAPY, isLoading: apyLoading } = useMarketsAPY();
	const { data: collateralFactors, isLoading: collateralLoading } = useMarketsCollateralFactors();
	const { data: nativeYieldData, isLoading: nativeYieldLoading } = useNativeYield();

	const allMarketAddresses = useMemo(() => {
		if (!supplyPositions && !borrowPositions) return [];
		const addresses = new Set<Address>();
		if (supplyPositions) {
			Object.keys(supplyPositions).forEach((addr) => addresses.add(addr as Address));
		}
		if (borrowPositions) {
			Object.keys(borrowPositions).forEach((addr) => addresses.add(addr as Address));
		}
		return Array.from(addresses);
	}, [supplyPositions, borrowPositions]);

	const { data: priceResults, isLoading: pricesLoading } = useTokenPrices(allMarketAddresses);
	const { data: tokenMetadata, isLoading: tokenMetadataLoading } = useTokenMetadata(allMarketAddresses);

	const isLoading =
		supplyLoading ||
		borrowLoading ||
		liquidityLoading ||
		apyLoading ||
		collateralLoading ||
		pricesLoading ||
		nativeYieldLoading ||
		tokenMetadataLoading;

	const metrics = useMemo(() => {
		if (
			!address ||
			!supplyPositions ||
			!borrowPositions ||
			!accountLiquidity ||
			!marketsAPY ||
			!collateralFactors ||
			!priceResults ||
			!tokenMetadata
		) {
			return null;
		}

		const priceMap = new Map<Address, number>();
		allMarketAddresses.forEach((marketAddress, index) => {
			if (priceResults[index]?.status === 'success' && priceResults[index].result) {
				const result = priceResults[index].result;
				const oraclePrice = typeof result === 'bigint' ? result : BigInt(String(result));
				const priceUSD = parseFloat(formatUnits(oraclePrice, 18));
				priceMap.set(marketAddress, priceUSD);
			} else {
				const fallbackPrice = PriceService.getFallbackPrice(marketAddress);
				priceMap.set(marketAddress, fallbackPrice);
			}
		});

		let totalSupplyValue = 0;
		let totalBorrowValue = 0;
		let weightedSupplyAPY = 0;
		let weightedBorrowAPY = 0;

		Object.entries(supplyPositions).forEach(([marketAddress, position]) => {
			if (position.balance > 0n) {
				const marketData = marketsAPY[marketAddress as Address];
				const priceUSD = priceMap.get(marketAddress as Address) || 1;

				if (marketData) {
					const positionValue = parseFloat(formatUnits(position.balance, 18)) * priceUSD;
					let apy = parseFloat(marketData.supplyAPY || '0');

					if (nativeYieldData?.apy && parseFloat(nativeYieldData.apy) > 0) {
						const metadata = tokenMetadata[marketAddress as Address];
						const symbol = metadata?.underlyingSymbol || '';
						const isAPEToken = symbol.toUpperCase() === 'APE';

						if (isAPEToken) {
							apy += parseFloat(nativeYieldData.apy);
						}
					}

					weightedSupplyAPY += positionValue * apy;
					totalSupplyValue += positionValue;
				}
			}
		});

		Object.entries(borrowPositions).forEach(([marketAddress, position]) => {
			if (position.balance > 0n) {
				const marketData = marketsAPY[marketAddress as Address];
				const priceUSD = priceMap.get(marketAddress as Address) || 1;

				if (marketData) {
					const positionValue = parseFloat(formatUnits(position.balance, 18)) * priceUSD;
					const apy = parseFloat(marketData.borrowAPY || '0');

					weightedBorrowAPY += positionValue * apy;
					totalBorrowValue += positionValue;
				}
			}
		});

		const avgSupplyAPY = totalSupplyValue > 0 ? weightedSupplyAPY / totalSupplyValue : 0;
		const avgBorrowAPY = totalBorrowValue > 0 ? weightedBorrowAPY / totalBorrowValue : 0;
		const netAPY = avgSupplyAPY - avgBorrowAPY;

		const positions: PositionData[] = [];

		Object.entries(supplyPositions).forEach(([marketAddress, position]) => {
			const borrowBalance = borrowPositions[marketAddress as Address]?.balance || 0n;
			if (position.balance > 0n || borrowBalance > 0n) {
				const collateralFactor = collateralFactors[marketAddress as Address] || 0;
				const priceUSD = priceMap.get(marketAddress as Address) || 1;

				positions.push({
					marketAddress: marketAddress as Address,
					suppliedBalance: position.balance,
					borrowedBalance: borrowBalance,
					collateralFactor,
					priceUSD,
					decimals: 18,
				});
			}
		});

		Object.entries(borrowPositions).forEach(([marketAddress, position]) => {
			if (position.balance > 0n && !supplyPositions[marketAddress as Address]) {
				const collateralFactor = collateralFactors[marketAddress as Address] || 0;
				const priceUSD = priceMap.get(marketAddress as Address) || 1;

				positions.push({
					marketAddress: marketAddress as Address,
					suppliedBalance: 0n,
					borrowedBalance: position.balance,
					collateralFactor,
					priceUSD,
					decimals: 18,
				});
			}
		});

		const healthFactorData = HealthFactorService.calculateHealthFactor(
			positions,
			accountLiquidity as [bigint, bigint, bigint],
		);
		const healthFactor = healthFactorData.healthFactor;

		const totalBorrowedUSD = healthFactorData.totalBorrowedUSD;
		const totalCollateralUSD = healthFactorData.totalCollateralUSD;
		const availableBorrowUSD = healthFactorData.availableBorrowUSD;

		let borrowUsage = 0;
		if (totalCollateralUSD > 0 && healthFactorData.liquidationThreshold > 0) {
			const maxBorrowCapacity = totalCollateralUSD * healthFactorData.liquidationThreshold;
			if (maxBorrowCapacity > 0) {
				borrowUsage = (totalBorrowedUSD / maxBorrowCapacity) * 100;
				borrowUsage = Math.min(Math.max(borrowUsage, 0), 100);
			}
		}

		const cumulativeLTV = healthFactorData.liquidationThreshold * 100;

		const nativeYieldInfo = {
			apy: nativeYieldData?.apy || '0.00',
			yieldMode: nativeYieldData ? NativeYieldService.getYieldModeDisplay(nativeYieldData.yieldMode) : 'Disabled',
			isEnabled: nativeYieldData ? NativeYieldService.isNativeYieldEnabled(nativeYieldData.yieldMode) : false,
			apeBalance: nativeYieldData
				? NativeYieldService.formatYieldAmount(nativeYieldData.balanceValues.shares)
				: '0 APE',
			estimatedDailyYield: '0 APE',
			estimatedMonthlyYield: '0 APE',
			comparison: null as { better: 'native' | 'lending' | 'equal'; difference: string } | null,
		};

		if (nativeYieldData && nativeYieldData.balanceValues.shares > 0n) {
			const dailyYield = NativeYieldService.calculateDailyYield(
				nativeYieldData.apy,
				nativeYieldData.balanceValues.shares,
			);
			const monthlyYield = dailyYield * 30n;

			nativeYieldInfo.estimatedDailyYield = NativeYieldService.formatYieldAmount(dailyYield);
			nativeYieldInfo.estimatedMonthlyYield = NativeYieldService.formatYieldAmount(monthlyYield);

			nativeYieldInfo.comparison = NativeYieldService.compareYields(nativeYieldData.apy, netAPY.toFixed(2));
		}

		return {
			netAPY: netAPY.toFixed(2),
			healthFactor,
			borrowUsage: borrowUsage.toFixed(1),
			cumulativeLTV: cumulativeLTV.toFixed(1),
			totalSuppliedUSD: Math.round(totalCollateralUSD),
			totalBorrowedUSD: Math.round(totalBorrowedUSD),
			availableBorrowUSD: Math.round(availableBorrowUSD),
			nativeYield: nativeYieldInfo,
		};
	}, [
		address,
		supplyPositions,
		borrowPositions,
		accountLiquidity,
		marketsAPY,
		collateralFactors,
		priceResults,
		allMarketAddresses,
		nativeYieldData,
		tokenMetadata,
	]);

	return {
		data: metrics,
		isLoading,
	};
}
