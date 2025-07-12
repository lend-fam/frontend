import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';
import { useAccountLiquidity, useUserSupplyPositions, useUserBorrowPositions, useMarketsAPY, useMarketsCollateralFactors } from './use-markets.hook';

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

	// Fetch user positions and market data
	const { data: supplyPositions, isLoading: supplyLoading } = useUserSupplyPositions(address);
	const { data: borrowPositions, isLoading: borrowLoading } = useUserBorrowPositions(address);
	const { data: accountLiquidity, isLoading: liquidityLoading } = useAccountLiquidity(address);
	const { data: marketsAPY, isLoading: apyLoading } = useMarketsAPY();
	const { data: collateralFactors, isLoading: collateralLoading } = useMarketsCollateralFactors();

	const isLoading = supplyLoading || borrowLoading || liquidityLoading || apyLoading || collateralLoading;

	const metrics = useMemo(() => {
		if (!address || !supplyPositions || !borrowPositions || !accountLiquidity || !marketsAPY || !collateralFactors) {
			return null;
		}

		// Count active positions for Net APY calculation
		let supplyPositionsCount = 0;
		let borrowPositionsCount = 0;
		let totalSupplyAPY = 0;
		let totalBorrowAPY = 0;

		// Calculate average supply APY
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

		// Calculate average borrow APY
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

		// Calculate Net APY (simplified calculation)
		const avgSupplyAPY = supplyPositionsCount > 0 ? totalSupplyAPY / supplyPositionsCount : 0;
		const avgBorrowAPY = borrowPositionsCount > 0 ? totalBorrowAPY / borrowPositionsCount : 0;
		const netAPY = avgSupplyAPY - avgBorrowAPY;

		// Calculate Health Factor
		// accountLiquidity returns [error, liquidity, shortfall]
		const [, liquidity, shortfall] = accountLiquidity as [bigint, bigint, bigint];

		let healthFactor = '∞';
		const hasAnyBorrows = borrowPositionsCount > 0;

		if (hasAnyBorrows) {
			if (shortfall && shortfall > 0n) {
				// If there's shortfall, health factor is less than 1
				healthFactor = '0.95'; // Approximate when in shortfall
			} else if (liquidity && liquidity > 0n) {
				// Calculate approximation based on liquidity
				const liquidityValue = parseFloat(formatUnits(liquidity, 18));
				// This is a simplified calculation - a more accurate one would need price data
				if (liquidityValue > 1000) {
					healthFactor = '2.50';
				} else if (liquidityValue > 100) {
					healthFactor = '1.90';
				} else {
					healthFactor = '1.25';
				}
			}
		}

		// Calculate Borrow Usage
		let borrowUsage = 0;
		if (hasAnyBorrows) {
			// Get total borrowed amount (count of positions as proxy)
			const totalBorrowPositions = borrowPositionsCount;

			// Get available liquidity from account
			const availableLiquidityValue = liquidity ? parseFloat(formatUnits(liquidity, 18)) : 0;

			// Calculate usage as ratio of borrowed positions to capacity
			// This is simplified - in reality you'd need USD values of borrowed amounts
			if (availableLiquidityValue > 0) {
				// Estimate total capacity based on liquidity and current borrows
				const estimatedTotalCapacity = availableLiquidityValue + totalBorrowPositions * 1000; // Rough estimate
				const estimatedCurrentBorrows = totalBorrowPositions * 1000; // Rough estimate

				borrowUsage = (estimatedCurrentBorrows / estimatedTotalCapacity) * 100;

				// Cap between 0-100%
				borrowUsage = Math.min(Math.max(borrowUsage, 0), 100);
			} else if (totalBorrowPositions > 0) {
				// If no available liquidity but has borrows, usage is high
				borrowUsage = 85;
			}
		}

		// Calculate Cumulative LTV - maximum borrowing capacity based on actual collateral factors
		let cumulativeLTV = 0;
		let totalSuppliedValue = 0;
		let totalMaxBorrowingCapacity = 0;

		// Calculate max borrowing capacity for each supplied market
		Object.entries(supplyPositions).forEach(([marketAddress, position]) => {
			if (position?.balance > 0n) {
				const collateralFactor = collateralFactors[marketAddress as Address];
				
				if (collateralFactor !== undefined) {
					const balanceInTokens = parseFloat(formatUnits(position.balance, 18));
					
					totalSuppliedValue += balanceInTokens;
					totalMaxBorrowingCapacity += balanceInTokens * collateralFactor;
				}
			}
		});

		// Calculate LTV percentage - what % of your supplied assets can be used for borrowing
		if (totalSuppliedValue > 0) {
			cumulativeLTV = (totalMaxBorrowingCapacity / totalSuppliedValue) * 100;
		}

		return {
			netAPY: netAPY.toFixed(2),
			healthFactor,
			borrowUsage: borrowUsage.toFixed(1),
			cumulativeLTV: cumulativeLTV.toFixed(1),
			totalSuppliedUSD: 0, // Placeholder
			totalBorrowedUSD: 0, // Placeholder
			availableBorrowUSD: 0, // Placeholder
		};
	}, [address, supplyPositions, borrowPositions, accountLiquidity, marketsAPY, collateralFactors]);

	return {
		data: metrics,
		isLoading,
	};
}
