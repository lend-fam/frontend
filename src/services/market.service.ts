import type { Market, UserMarketPosition } from '../types/market.types';
import { FormattingService } from './formatting.service';
import { MathService } from './math.service';

const apyCache = new Map<string, string>();

export class MarketService {
	static calculateSupplyAPY(supplyRatePerBlock: bigint): string {
		const cacheKey = `supply_${supplyRatePerBlock.toString()}`;
		return MathService.calculateAPYFromBlockRate(supplyRatePerBlock, apyCache, cacheKey);
	}

	static calculateBorrowAPY(borrowRatePerBlock: bigint): string {
		const cacheKey = `borrow_${borrowRatePerBlock.toString()}`;
		return MathService.calculateAPYFromBlockRate(borrowRatePerBlock, apyCache, cacheKey);
	}

	static formatTokenBalance(balance: bigint, decimals: number = 18, symbol: string = ''): string {
		return FormattingService.formatTokenBalance(balance, decimals, symbol);
	}

	static formatUSDValue(value: string): string {
		return FormattingService.formatUSDValue(value);
	}

	static formatCollateralFactor(collateralFactorMantissa: bigint): string {
		return FormattingService.formatCollateralFactor(collateralFactorMantissa);
	}

	static hasSupplied(userPosition: UserMarketPosition): boolean {
		return userPosition.suppliedBalance > 0n;
	}

	static hasBorrowed(userPosition: UserMarketPosition): boolean {
		return userPosition.borrowedBalance > 0n;
	}

	static isBorrowable(market: Market): boolean {
		return market.isListed;
	}

	static isCollateralEligible(market: Market): boolean {
		return market.isListed && market.collateralFactorMantissa > 0n;
	}

	/**
	 * Calculate the maximum amount a user can borrow based on their account liquidity
	 * @param accountLiquidity - User's account liquidity in USD (from getAccountLiquidity)
	 * @param marketLiquidity - Available cash in the market
	 * @param borrowCap - Market's borrow cap (0 means no cap)
	 * @param totalBorrows - Total borrowed amount in the market
	 * @returns Maximum borrowable amount
	 */
	static calculateMaxBorrowAmount(
		accountLiquidity: bigint,
		marketLiquidity: bigint,
		borrowCap: bigint = 0n,
		totalBorrows: bigint = 0n,
	): bigint {
		return MathService.calculateMaxBorrowAmount(accountLiquidity, marketLiquidity, borrowCap, totalBorrows);
	}

	/**
	 * Check if a borrow amount would put the user at risk of liquidation
	 * @param accountLiquidity - User's current account liquidity
	 * @param borrowAmountUSD - Borrow amount in USD
	 * @param safetyThreshold - Safety threshold (default 1.1 = 110%)
	 * @returns true if the borrow is safe
	 */
	static isBorrowSafe(accountLiquidity: bigint, borrowAmountUSD: bigint, safetyThreshold: number = 1.1): boolean {
		return MathService.isBorrowSafe(accountLiquidity, borrowAmountUSD, safetyThreshold);
	}

	/**
	 * Get minimum borrow amount for a token (typically 0.001 tokens)
	 * @param tokenDecimals - Token decimals
	 * @returns Minimum borrow amount in wei
	 */
	static getMinBorrowAmount(tokenDecimals: number): bigint {
		return MathService.getMinBorrowAmount(tokenDecimals);
	}

	/**
	 * Process account liquidity result from Comptroller.getAccountLiquidity
	 * @param accountLiquidityResult - Result from getAccountLiquidity call
	 * @returns Object with processed liquidity data
	 */
	static processAccountLiquidity(accountLiquidityResult: [bigint, bigint, bigint] | undefined): {
		error: boolean;
		liquidity: bigint;
		shortfall: bigint;
		canBorrow: boolean;
		hasNegativeLiquidity: boolean;
	} {
		if (!accountLiquidityResult) {
			return {
				error: true,
				liquidity: 0n,
				shortfall: 0n,
				canBorrow: false,
				hasNegativeLiquidity: false,
			};
		}

		const [error, liquidity, shortfall] = accountLiquidityResult;

		return {
			error: error !== 0n,
			liquidity,
			shortfall,
			canBorrow: error === 0n && liquidity > 0n && shortfall === 0n,
			hasNegativeLiquidity: shortfall > 0n,
		};
	}

	/**
	 * Calculate utilization rate for a market using the standard Compound formula
	 * @param totalBorrows - Total borrowed amount in underlying tokens
	 * @param cash - Available cash in the market
	 * @param totalReserves - Total reserves in the market
	 * @returns Utilization rate as a percentage
	 */
	static calculateUtilizationRate(totalBorrows: bigint, cash: bigint, totalReserves: bigint): number {
		return MathService.calculateUtilizationRate(totalBorrows, cash, totalReserves);
	}
}
