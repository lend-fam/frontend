import { formatUnits } from 'viem';
import { BLOCKS_PER_YEAR } from '../contracts';
import { SAFETY_THRESHOLDS, NATIVE_YIELD_CONSTANTS, BIGINT_CONSTANTS, FORMATTING_THRESHOLDS } from '../constants';

/**
 * Centralized math service for consistent calculations across the application
 */
export class MathService {
	/**
	 * Calculate Supply/Borrow APY from rate per block
	 * @param ratePerBlock - Rate per block in wei (18 decimals)
	 * @param cache - Optional cache map for memoization
	 * @param cacheKey - Cache key for memoization
	 * @returns APY as formatted percentage string
	 */
	static calculateAPYFromBlockRate(
		ratePerBlock: bigint,
		cache?: Map<string, string>,
		cacheKey?: string
	): string {
		if (ratePerBlock === 0n) return '0.00';

		// Check cache if provided
		if (cache && cacheKey) {
			const cached = cache.get(cacheKey);
			if (cached) return cached;
		}

		const ratePerBlockNumber = Number(formatUnits(ratePerBlock, FORMATTING_THRESHOLDS.DEFAULT_DECIMALS));
		const apy = ratePerBlockNumber * BLOCKS_PER_YEAR * 100;
		const result = apy.toFixed(FORMATTING_THRESHOLDS.PERCENTAGE_DECIMALS);

		// Store in cache if provided
		if (cache && cacheKey) {
			cache.set(cacheKey, result);
		}

		return result;
	}

	/**
	 * Calculate Native Yield APY from raw contract value (9 decimal places)
	 * @param apyRaw - Raw APY value from contract (9 decimals)
	 * @returns APY as formatted percentage string
	 */
	static calculateNativeYieldAPY(apyRaw: bigint): string {
		if (apyRaw === 0n) return '0.00';
		const apy = Number(apyRaw) / NATIVE_YIELD_CONSTANTS.NATIVE_APY_DIVISOR;
		return apy.toFixed(FORMATTING_THRESHOLDS.PERCENTAGE_DECIMALS);
	}

	/**
	 * Safely convert BigInt to Number with decimal handling
	 * @param value - BigInt value to convert
	 * @param decimals - Number of decimal places
	 * @returns Number representation
	 */
	static safeBigIntToNumber(value: bigint, decimals: number = FORMATTING_THRESHOLDS.DEFAULT_DECIMALS): number {
		try {
			const formatted = formatUnits(value, decimals);
			const number = parseFloat(formatted);
			return isNaN(number) ? 0 : number;
		} catch {
			return 0;
		}
	}

	/**
	 * Calculate percentage from two BigInt values
	 * @param value - Numerator value
	 * @param total - Denominator value
	 * @returns Percentage as a number (0-100)
	 */
	static calculatePercentage(value: bigint, total: bigint): number {
		if (total === 0n || value === 0n) return 0;
		return Number((value * BIGINT_CONSTANTS.PERCENTAGE_SCALE) / total);
	}

	/**
	 * Calculate utilization rate for a market
	 * @param totalSupply - Total cTokens in circulation
	 * @param totalBorrows - Total borrowed amount in underlying tokens
	 * @param exchangeRate - Exchange rate from cTokens to underlying
	 * @returns Utilization rate as a percentage (0-100)
	 */
	static calculateUtilizationRate(totalSupply: bigint, totalBorrows: bigint, exchangeRate: bigint): number {
		if (totalSupply === 0n || exchangeRate === 0n) return 0;

		const totalSuppliedUnderlying = (totalSupply * exchangeRate) / BIGINT_CONSTANTS.MANTISSA_SCALE;
		if (totalSuppliedUnderlying === 0n) return 0;

		const utilizationRate = Number((totalBorrows * BIGINT_CONSTANTS.PERCENTAGE_SCALE) / totalSuppliedUnderlying);
		return Math.max(0, Math.min(100, utilizationRate));
	}

	/**
	 * Calculate accumulated yield based on balance and time
	 * @param balance - Current balance
	 * @param yieldRatePerBlock - Yield rate per block
	 * @param blocksSinceUpdate - Number of blocks since last update
	 * @returns Accumulated yield amount
	 */
	static calculateAccumulatedYield(balance: bigint, yieldRatePerBlock: bigint, blocksSinceUpdate: bigint): bigint {
		if (balance === 0n || yieldRatePerBlock === 0n || blocksSinceUpdate === 0n) {
			return 0n;
		}
		return (balance * yieldRatePerBlock * blocksSinceUpdate) / BIGINT_CONSTANTS.MANTISSA_SCALE;
	}

	/**
	 * Calculate daily yield from APY
	 * @param apy - Annual percentage yield as string
	 * @param balance - Balance to calculate yield for
	 * @returns Daily yield amount in wei
	 */
	static calculateDailyYield(apy: string, balance: bigint): bigint {
		if (balance === 0n) return 0n;

		const apyNumber = parseFloat(apy);
		if (apyNumber === 0) return 0n;

		const dailyRate = apyNumber / NATIVE_YIELD_CONSTANTS.DAYS_PER_YEAR / 100;
		const balanceNumber = Number(formatUnits(balance, FORMATTING_THRESHOLDS.DEFAULT_DECIMALS));
		const dailyYield = balanceNumber * dailyRate;

		return BigInt(Math.floor(dailyYield * Number(BIGINT_CONSTANTS.WEI_PER_ETH)));
	}

	/**
	 * Compare two yields and return the better one
	 * @param yield1 - First yield as string
	 * @param yield2 - Second yield as string
	 * @param yield1Label - Label for the first yield
	 * @param yield2Label - Label for the second yield
	 * @returns Object containing comparison result
	 */
	static compareYields<T extends string, U extends string>(
		yield1: string,
		yield2: string,
		yield1Label: T,
		yield2Label: U
	): {
		better: T | U | 'equal';
		difference: string;
	} {
		const rate1 = parseFloat(yield1);
		const rate2 = parseFloat(yield2);

		if (rate1 === rate2) {
			return { better: 'equal', difference: '0.00' };
		}

		if (rate1 > rate2) {
			return {
				better: yield1Label,
				difference: (rate1 - rate2).toFixed(2),
			};
		}

		return {
			better: yield2Label,
			difference: (rate2 - rate1).toFixed(2),
		};
	}

	/**
	 * Calculate health factor from account liquidity
	 * @param accountLiquidity - Available liquidity
	 * @param borrowAmountUSD - Borrow amount in USD
	 * @returns Health factor as a number
	 */
	static calculateHealthFactor(accountLiquidity: bigint, borrowAmountUSD: bigint): number {
		if (accountLiquidity === 0n || borrowAmountUSD === 0n) return 0;

		const remainingLiquidity = accountLiquidity - borrowAmountUSD;
		if (remainingLiquidity <= 0n) return 0;

		return Number(formatUnits(remainingLiquidity, FORMATTING_THRESHOLDS.DEFAULT_DECIMALS)) / Number(formatUnits(borrowAmountUSD, FORMATTING_THRESHOLDS.DEFAULT_DECIMALS));
	}

	/**
	 * Check if a borrow amount is safe based on health factor
	 * @param accountLiquidity - User's current account liquidity
	 * @param borrowAmountUSD - Borrow amount in USD
	 * @param safetyThreshold - Safety threshold (default 1.1 = 110%)
	 * @returns true if the borrow is safe
	 */
	static isBorrowSafe(accountLiquidity: bigint, borrowAmountUSD: bigint, safetyThreshold: number = SAFETY_THRESHOLDS.DEFAULT_HEALTH_FACTOR): boolean {
		const healthFactor = this.calculateHealthFactor(accountLiquidity, borrowAmountUSD);
		return healthFactor >= safetyThreshold;
	}

	/**
	 * Calculate minimum borrow amount for a token
	 * @param tokenDecimals - Token decimals
	 * @returns Minimum borrow amount in wei
	 */
	static getMinBorrowAmount(tokenDecimals: number): bigint {
		return BigInt(10 ** Math.max(0, tokenDecimals - 3)); // 0.001 tokens minimum
	}

	/**
	 * Calculate maximum borrow amount based on constraints
	 * @param accountLiquidity - User's account liquidity in USD
	 * @param marketLiquidity - Available cash in the market
	 * @param borrowCap - Market's borrow cap (0 means no cap)
	 * @param totalBorrows - Total borrowed amount in the market
	 * @returns Maximum borrowable amount
	 */
	static calculateMaxBorrowAmount(
		accountLiquidity: bigint,
		marketLiquidity: bigint,
		borrowCap: bigint = 0n,
		totalBorrows: bigint = 0n
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
}