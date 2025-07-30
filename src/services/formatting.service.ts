import { formatUnits } from 'viem';
import { FORMATTING_THRESHOLDS, DISPLAY_FORMATS } from '../constants';

/**
 * Centralized formatting service for consistent data presentation
 */
export class FormattingService {
	/**
	 * Format a USD value with proper currency formatting
	 * @param value - String representation of the USD value
	 * @returns Formatted USD string
	 */
	static formatUSDValue(value: string): string {
		const number = parseFloat(value);

		if (number === 0) return '$0.00';
		if (number < FORMATTING_THRESHOLDS.MIN_CURRENCY_VALUE) return '<$0.01';

		return new Intl.NumberFormat('en-US', DISPLAY_FORMATS.CURRENCY).format(number);
	}

	/**
	 * Format a token balance with appropriate decimal places and compact notation
	 * @param balance - Token balance in wei
	 * @param decimals - Token decimals (default 18)
	 * @param symbol - Token symbol
	 * @returns Formatted token balance string
	 */
	static formatTokenBalance(
		balance: bigint,
		decimals: number = FORMATTING_THRESHOLDS.DEFAULT_DECIMALS,
		symbol: string = '',
	): string {
		const formatted = formatUnits(balance, decimals);
		const number = parseFloat(formatted);
		const symbolSuffix = symbol ? ` ${symbol}` : '';

		if (number === 0 || number < FORMATTING_THRESHOLDS.MIN_DISPLAY_VALUE) return `0${symbolSuffix}`;
		if (number < FORMATTING_THRESHOLDS.MIN_CURRENCY_VALUE) return `<0.01${symbolSuffix}`;
		if (number < 1) return `${number.toFixed(FORMATTING_THRESHOLDS.PRECISE_DECIMALS)}${symbolSuffix}`;
		if (number < FORMATTING_THRESHOLDS.COMPACT_THRESHOLD)
			return `${number.toFixed(FORMATTING_THRESHOLDS.CURRENCY_DECIMALS)}${symbolSuffix}`;

		const formatter = new Intl.NumberFormat('en-US', DISPLAY_FORMATS.COMPACT);

		return `${formatter.format(number)}${symbolSuffix}`;
	}

	/**
	 * Format a percentage value
	 * @param value - Percentage value as a number
	 * @param decimals - Number of decimal places (default 2)
	 * @returns Formatted percentage string
	 */
	static formatPercentage(value: number, decimals: number = FORMATTING_THRESHOLDS.PERCENTAGE_DECIMALS): string {
		return `${value.toFixed(decimals)}%`;
	}

	/**
	 * Format a compact number with appropriate notation
	 * @param number - Number to format
	 * @param decimals - Maximum decimal places (default 2)
	 * @returns Formatted compact number string
	 */
	static formatCompactNumber(number: number, decimals: number = FORMATTING_THRESHOLDS.COMPACT_DECIMALS): string {
		if (number === 0) return '0';
		if (number < FORMATTING_THRESHOLDS.MIN_DISPLAY_VALUE) return '<0.000001';
		if (number < FORMATTING_THRESHOLDS.MIN_CURRENCY_VALUE) return '<0.01';
		if (number < FORMATTING_THRESHOLDS.COMPACT_THRESHOLD) return number.toFixed(decimals);

		const formatter = new Intl.NumberFormat('en-US', {
			notation: 'compact',
			maximumFractionDigits: decimals,
		});

		return formatter.format(number);
	}

	/**
	 * Format a collateral factor from mantissa to percentage
	 * @param collateralFactorMantissa - Collateral factor in mantissa format
	 * @returns Formatted percentage string
	 */
	static formatCollateralFactor(collateralFactorMantissa: bigint): string {
		const factor = Number(formatUnits(collateralFactorMantissa, FORMATTING_THRESHOLDS.DEFAULT_DECIMALS)) * 100;
		return `${factor.toFixed(0)}%`;
	}
}
