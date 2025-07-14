import { formatUnits } from 'viem';
import type { Market, UserMarketPosition } from '../types/market.types';
import { BLOCKS_PER_YEAR } from '../contracts';

const apyCache = new Map<string, string>();

export class MarketService {
	static calculateSupplyAPY(supplyRatePerBlock: bigint): string {
		if (supplyRatePerBlock === 0n) return '0.00';

		const cacheKey = `supply_${supplyRatePerBlock.toString()}`;
		const cached = apyCache.get(cacheKey);
		if (cached) return cached;

		const ratePerBlock = Number(formatUnits(supplyRatePerBlock, 18));
		const apy = ratePerBlock * BLOCKS_PER_YEAR * 100;
		const result = apy.toFixed(2);

		apyCache.set(cacheKey, result);
		return result;
	}

	static calculateBorrowAPY(borrowRatePerBlock: bigint): string {
		if (borrowRatePerBlock === 0n) return '0.00';

		const cacheKey = `borrow_${borrowRatePerBlock.toString()}`;
		const cached = apyCache.get(cacheKey);
		if (cached) return cached;

		const ratePerBlock = Number(formatUnits(borrowRatePerBlock, 18));
		const apy = ratePerBlock * BLOCKS_PER_YEAR * 100;
		const result = apy.toFixed(2);

		apyCache.set(cacheKey, result);
		return result;
	}

	static formatTokenBalance(balance: bigint, decimals: number = 18, symbol: string = ''): string {
		const formatted = formatUnits(balance, decimals);
		const number = parseFloat(formatted);

		if (number === 0 || number < 0.000001) return `0 ${symbol}`.trim();
		if (number < 0.01) return `<0.01 ${symbol}`.trim();
		if (number < 1) return `${number.toFixed(4)} ${symbol}`.trim();
		if (number < 1000) return `${number.toFixed(2)} ${symbol}`.trim();

		const formatter = new Intl.NumberFormat('en-US', {
			notation: 'compact',
			maximumFractionDigits: 2,
		});

		return `${formatter.format(number)} ${symbol}`.trim();
	}

	static formatUSDValue(value: string): string {
		const number = parseFloat(value);

		if (number === 0) return '$0.00';
		if (number < 0.01) return '<$0.01';

		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(number);
	}

	static formatCollateralFactor(collateralFactorMantissa: bigint): string {
		const factor = Number(formatUnits(collateralFactorMantissa, 18)) * 100;
		return `${factor.toFixed(0)}%`;
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
		// Start with the minimum of account liquidity and market liquidity
		let maxBorrow = accountLiquidity < marketLiquidity ? accountLiquidity : marketLiquidity;

		// Apply borrow cap if set
		if (borrowCap > 0n && totalBorrows < borrowCap) {
			const remainingCap = borrowCap - totalBorrows;
			maxBorrow = maxBorrow < remainingCap ? maxBorrow : remainingCap;
		}

		return maxBorrow;
	}

	/**
	 * Check if a borrow amount would put the user at risk of liquidation
	 * @param accountLiquidity - User's current account liquidity
	 * @param borrowAmountUSD - Borrow amount in USD
	 * @param safetyThreshold - Safety threshold (default 1.1 = 110%)
	 * @returns true if the borrow is safe
	 */
	static isBorrowSafe(accountLiquidity: bigint, borrowAmountUSD: bigint, safetyThreshold: number = 1.1): boolean {
		if (accountLiquidity === 0n || borrowAmountUSD === 0n) return false;

		const remainingLiquidity = accountLiquidity - borrowAmountUSD;
		if (remainingLiquidity <= 0n) return false;

		const healthFactor = Number(formatUnits(remainingLiquidity, 18)) / Number(formatUnits(borrowAmountUSD, 18));
		return healthFactor >= safetyThreshold;
	}

	/**
	 * Get minimum borrow amount for a token (typically 0.001 tokens)
	 * @param tokenDecimals - Token decimals
	 * @returns Minimum borrow amount in wei
	 */
	static getMinBorrowAmount(tokenDecimals: number): bigint {
		return BigInt(10 ** Math.max(0, tokenDecimals - 3));
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
	 * Calculate utilization rate for a market
	 * @param totalSupply - Total cTokens in circulation
	 * @param totalBorrows - Total borrowed amount in underlying tokens
	 * @param exchangeRate - Exchange rate from cTokens to underlying
	 * @returns Utilization rate as a percentage
	 */
	static calculateUtilizationRate(totalSupply: bigint, totalBorrows: bigint, exchangeRate: bigint): number {
		if (totalSupply === 0n || exchangeRate === 0n) return 0;

		const totalSuppliedUnderlying = (totalSupply * exchangeRate) / 10n ** 18n;

		if (totalSuppliedUnderlying === 0n) return 0;

		const utilizationRate = Number((totalBorrows * 100n) / totalSuppliedUnderlying);

		return Math.max(0, Math.min(100, utilizationRate));
	}
}
