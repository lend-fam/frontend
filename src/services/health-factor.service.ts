import { formatUnits } from 'viem';
import type { Address } from 'viem';

export interface HealthFactorData {
	healthFactor: string;
	totalCollateralUSD: number;
	totalBorrowedUSD: number;
	availableBorrowUSD: number;
	liquidationThreshold: number;
}

export interface PositionData {
	marketAddress: Address;
	suppliedBalance: bigint;
	borrowedBalance: bigint;
	collateralFactor: number;
	priceUSD: number;
	decimals: number;
}

export class HealthFactorService {
	/**
	 * Calculate health factor using Compound protocol formula
	 * Health Factor = (Total Collateral Value × Weighted Average Liquidation Threshold) / Total Borrowed Value
	 */
	static calculateHealthFactor(
		positions: PositionData[],
		accountLiquidity?: [bigint, bigint, bigint] | null,
	): HealthFactorData {
		if (!positions.length) {
			return {
				healthFactor: '∞',
				totalCollateralUSD: 0,
				totalBorrowedUSD: 0,
				availableBorrowUSD: 0,
				liquidationThreshold: 0,
			};
		}

		let totalCollateralUSD = 0;
		let totalBorrowedUSD = 0;
		let weightedCollateralValue = 0;

		for (const position of positions) {
			const suppliedTokens = parseFloat(formatUnits(position.suppliedBalance, position.decimals));
			const suppliedValueUSD = suppliedTokens * position.priceUSD;
			totalCollateralUSD += suppliedValueUSD;

			const borrowedTokens = parseFloat(formatUnits(position.borrowedBalance, position.decimals));
			const borrowedValueUSD = borrowedTokens * position.priceUSD;
			totalBorrowedUSD += borrowedValueUSD;

			weightedCollateralValue += suppliedValueUSD * position.collateralFactor;
		}

		let availableBorrowUSD = 0;
		if (accountLiquidity) {
			const [, liquidity] = accountLiquidity;
			availableBorrowUSD = parseFloat(formatUnits(liquidity, 18));
		}

		const liquidationThreshold = totalCollateralUSD > 0 ? weightedCollateralValue / totalCollateralUSD : 0;

		let healthFactor: string;
		if (totalBorrowedUSD === 0) {
			healthFactor = '∞';
		} else {
			const factor = weightedCollateralValue / totalBorrowedUSD;
			healthFactor = factor.toFixed(2);
		}

		return {
			healthFactor,
			totalCollateralUSD,
			totalBorrowedUSD,
			availableBorrowUSD,
			liquidationThreshold,
		};
	}

	/**
	 * Calculate health factor change for a transaction
	 */
	static calculateHealthFactorChange(
		currentPositions: PositionData[],
		transactionType: 'supply' | 'borrow' | 'withdraw' | 'repay',
		transactionAmount: bigint,
		transactionMarket: Address,
		accountLiquidity?: [bigint, bigint, bigint] | null,
	): { current: string; new: string } {
		const currentHealthFactor = this.calculateHealthFactor(currentPositions, accountLiquidity);

		const newPositions = currentPositions.map((position) => {
			if (position.marketAddress !== transactionMarket) {
				return position;
			}

			const updatedPosition = { ...position };
			switch (transactionType) {
				case 'supply':
					updatedPosition.suppliedBalance += transactionAmount;
					break;
				case 'borrow':
					updatedPosition.borrowedBalance += transactionAmount;
					break;
				case 'withdraw':
					updatedPosition.suppliedBalance =
						updatedPosition.suppliedBalance > transactionAmount
							? updatedPosition.suppliedBalance - transactionAmount
							: 0n;
					break;
				case 'repay':
					updatedPosition.borrowedBalance =
						updatedPosition.borrowedBalance > transactionAmount
							? updatedPosition.borrowedBalance - transactionAmount
							: 0n;
					break;
			}
			return updatedPosition;
		});

		const newHealthFactor = this.calculateHealthFactor(newPositions, accountLiquidity);

		return {
			current: currentHealthFactor.healthFactor,
			new: newHealthFactor.healthFactor,
		};
	}

	/**
	 * Determine health factor risk level
	 */
	static getHealthFactorRisk(healthFactor: string): 'safe' | 'moderate' | 'high' | 'critical' {
		if (healthFactor === '∞') return 'safe';

		const factor = parseFloat(healthFactor);
		if (factor >= 2.0) return 'safe';
		if (factor >= 1.5) return 'moderate';
		if (factor >= 1.1) return 'high';
		return 'critical';
	}

	/**
	 * Check if a transaction would cause liquidation risk
	 */
	static isLiquidationRisk(healthFactor: string, threshold: number = 1.1): boolean {
		if (healthFactor === '∞') return false;
		return parseFloat(healthFactor) < threshold;
	}

	/**
	 * Calculate maximum safe borrow amount to maintain health factor above threshold
	 */
	static calculateMaxSafeBorrow(
		positions: PositionData[],
		_targetMarket: Address,
		targetMarketPrice: number,
		targetMarketDecimals: number,
		minHealthFactor: number = 1.2,
	): bigint {
		const healthFactorData = this.calculateHealthFactor(positions);

		if (healthFactorData.totalCollateralUSD === 0) {
			return 0n;
		}

		const maxTotalBorrowUSD =
			(healthFactorData.totalCollateralUSD * healthFactorData.liquidationThreshold) / minHealthFactor;
		const additionalBorrowUSD = Math.max(0, maxTotalBorrowUSD - healthFactorData.totalBorrowedUSD);

		const additionalBorrowTokens = additionalBorrowUSD / targetMarketPrice;
		const safeAdditionalBorrowTokens = additionalBorrowTokens * 0.99;

		if (safeAdditionalBorrowTokens <= 0) {
			return 0n;
		}

		try {
			return BigInt(Math.floor(safeAdditionalBorrowTokens * Math.pow(10, targetMarketDecimals)));
		} catch {
			return 0n;
		}
	}
}
