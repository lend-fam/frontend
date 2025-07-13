import { formatUnits } from 'viem';
import type { Market, UserMarketPosition } from '../types/market.types';
import { BLOCKS_PER_YEAR } from '../contracts';

export class MarketService {
	/**
	 * Convert supply rate per block to APY percentage
	 */
	static calculateSupplyAPY(supplyRatePerBlock: bigint): string {
		if (supplyRatePerBlock === 0n) return '0.00';

		const ratePerBlock = Number(formatUnits(supplyRatePerBlock, 18));
		const apy = (Math.pow(1 + ratePerBlock * BLOCKS_PER_YEAR, 1) - 1) * 100;

		return apy.toFixed(2);
	}

	/**
	 * Convert borrow rate per block to APY percentage
	 */
	static calculateBorrowAPY(borrowRatePerBlock: bigint): string {
		if (borrowRatePerBlock === 0n) return '0.00';

		const ratePerBlock = Number(formatUnits(borrowRatePerBlock, 18));
		const apy = (Math.pow(1 + ratePerBlock * BLOCKS_PER_YEAR, 1) - 1) * 100;

		return apy.toFixed(2);
	}

	/**
	 * Format token balance for display
	 */
	static formatTokenBalance(balance: bigint, decimals: number = 18, symbol: string = ''): string {
		const formatted = formatUnits(balance, decimals);
		const number = parseFloat(formatted);

		if (number === 0 || number < 0.000001) return `0 ${symbol}`.trim();
		if (number < 0.01) return `<0.01 ${symbol}`.trim();
		if (number < 1) return `${number.toFixed(4)} ${symbol}`.trim();
		if (number < 1000) return `${number.toFixed(2)} ${symbol}`.trim();

		// For larger numbers, use compact notation
		const formatter = new Intl.NumberFormat('en-US', {
			notation: 'compact',
			maximumFractionDigits: 2,
		});

		return `${formatter.format(number)} ${symbol}`.trim();
	}

	/**
	 * Format USD value for display
	 */
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

	/**
	 * Convert collateral factor mantissa to percentage
	 */
	static formatCollateralFactor(collateralFactorMantissa: bigint): string {
		const factor = Number(formatUnits(collateralFactorMantissa, 18)) * 100;
		return `${factor.toFixed(0)}%`;
	}

	/**
	 * Check if user has supplied to a market
	 */
	static hasSupplied(userPosition: UserMarketPosition): boolean {
		return userPosition.suppliedBalance > 0n;
	}

	/**
	 * Check if user has borrowed from a market
	 */
	static hasBorrowed(userPosition: UserMarketPosition): boolean {
		return userPosition.borrowedBalance > 0n;
	}

	/**
	 * Check if market is available for borrowing
	 */
	static isBorrowable(market: Market): boolean {
		return market.isListed;
	}

	/**
	 * Check if market can be used as collateral
	 */
	static isCollateralEligible(market: Market): boolean {
		return market.isListed && market.collateralFactorMantissa > 0n;
	}
}
