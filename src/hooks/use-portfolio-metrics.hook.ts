import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';
import { useAccountLiquidity } from './use-account-liquidity.hook';
import { useUserSupplyPositions, useUserBorrowPositions } from './use-user-positions.hook';
import { useMarketsAPY, useMarketsCollateralFactors } from './use-market-data.hook';
import { useTokenPrices, PriceService } from '../services/price.service';
import { HealthFactorService, type PositionData } from '../services/health-factor.service';

export interface PortfolioMetrics {
	netAPY: string;
	healthFactor: string;
	borrowUsage: string;
	cumulativeLTV: string;
	totalSuppliedUSD: number;
	totalBorrowedUSD: number;
	availableBorrowUSD: number;
}

/**
 * Hook to calculate portfolio metrics including Net APY, Health Factor, and Borrow Usage
 */
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

	const isLoading =
		supplyLoading || borrowLoading || liquidityLoading || apyLoading || collateralLoading || pricesLoading;

	const metrics = useMemo(() => {
		if (
			!address ||
			!supplyPositions ||
			!borrowPositions ||
			!accountLiquidity ||
			!marketsAPY ||
			!collateralFactors ||
			!priceResults
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

		let supplyPositionsCount = 0;
		let borrowPositionsCount = 0;
		let totalSupplyAPY = 0;
		let totalBorrowAPY = 0;

		Object.entries(supplyPositions).forEach(([marketAddress, position]) => {
			if (position.balance > 0n) {
				const marketData = marketsAPY[marketAddress as Address];
				if (marketData) {
					const apy = parseFloat(marketData.supplyAPY || '0');
					totalSupplyAPY += apy;
					supplyPositionsCount++;
				}
			}
		});

		Object.entries(borrowPositions).forEach(([marketAddress, position]) => {
			if (position.balance > 0n) {
				const marketData = marketsAPY[marketAddress as Address];
				if (marketData) {
					const apy = parseFloat(marketData.borrowAPY || '0');
					totalBorrowAPY += apy;
					borrowPositionsCount++;
				}
			}
		});

		const avgSupplyAPY = supplyPositionsCount > 0 ? totalSupplyAPY / supplyPositionsCount : 0;
		const avgBorrowAPY = borrowPositionsCount > 0 ? totalBorrowAPY / borrowPositionsCount : 0;
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

		return {
			netAPY: netAPY.toFixed(2),
			healthFactor,
			borrowUsage: borrowUsage.toFixed(1),
			cumulativeLTV: cumulativeLTV.toFixed(1),
			totalSuppliedUSD: Math.round(totalCollateralUSD),
			totalBorrowedUSD: Math.round(totalBorrowedUSD),
			availableBorrowUSD: Math.round(availableBorrowUSD),
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
	]);

	return {
		data: metrics,
		isLoading,
	};
}
