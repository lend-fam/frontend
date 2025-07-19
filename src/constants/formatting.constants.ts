/**
 * Formatting constants to centralize magic numbers across the application
 */
export const FORMATTING_THRESHOLDS = {
	/** Minimum display value for very small numbers */
	MIN_DISPLAY_VALUE: 0.000001,
	/** Minimum currency value for USD formatting */
	MIN_CURRENCY_VALUE: 0.01,
	/** Threshold for compact notation (1k, 1m, etc.) */
	COMPACT_THRESHOLD: 1000,
	/** Default token decimals */
	DEFAULT_DECIMALS: 18,
	/** Default currency decimal places */
	CURRENCY_DECIMALS: 2,
	/** Default percentage decimal places */
	PERCENTAGE_DECIMALS: 2,
	/** Maximum decimal places for compact numbers */
	COMPACT_DECIMALS: 2,
	/** Decimal places for precise token balances */
	PRECISE_DECIMALS: 4,
} as const;

/**
 * Safety and calculation constants
 */
export const SAFETY_THRESHOLDS = {
	/** Default health factor threshold for safe borrowing */
	DEFAULT_HEALTH_FACTOR: 1.1,
	/** Higher safety threshold for conservative borrowing */
	SAFE_HEALTH_FACTOR: 1.2,
	/** Buffer factor for transaction calculations */
	TRANSACTION_BUFFER: 0.99,
	/** Liquidation threshold */
	LIQUIDATION_THRESHOLD: 1.0,
} as const;

/**
 * Time-related constants
 */
export const TIME_CONSTANTS = {
	/** Days per year */
	DAYS_PER_YEAR: 365,
	/** Hours per day */
	HOURS_PER_DAY: 24,
	/** Minutes per hour */
	MINUTES_PER_HOUR: 60,
	/** Seconds per minute */
	SECONDS_PER_MINUTE: 60,
} as const;

/**
 * Native yield calculation constants
 */
export const NATIVE_YIELD_CONSTANTS = {
	/** Native yield APY decimal places (from contract) */
	NATIVE_APY_DECIMALS: 9,
	/** Native yield APY divisor (10^9) */
	NATIVE_APY_DIVISOR: 1000000000,
	/** Days per year for yield calculations */
	DAYS_PER_YEAR: TIME_CONSTANTS.DAYS_PER_YEAR,
} as const;

/**
 * BigInt calculation constants
 */
export const BIGINT_CONSTANTS = {
	/** Wei per ETH (10^18) */
	WEI_PER_ETH: 10n ** 18n,
	/** Mantissa scale (10^18) */
	MANTISSA_SCALE: 10n ** 18n,
	/** Percentage scale (100) */
	PERCENTAGE_SCALE: 100n,
	/** Minimum borrow amount divisor (10^3) */
	MIN_BORROW_DIVISOR: 10n ** 3n,
} as const;

/**
 * Token symbol constants
 */
export const TOKEN_SYMBOLS = {
	/** Native token symbols */
	NATIVE: {
		APE: 'APE',
		ETH: 'ETH',
		WETH: 'WETH',
	},
	/** Stablecoin symbols */
	STABLECOINS: {
		DAI: 'DAI',
		USDC: 'USDC',
		USDT: 'USDT',
		MDAI: 'MDAI',
		MUSDC: 'MUSDC',
		MUSDT: 'MUSDT',
	},
} as const;

/**
 * Default fallback prices for tokens (in USD)
 */
export const FALLBACK_PRICES = {
	[TOKEN_SYMBOLS.STABLECOINS.DAI]: 1.0,
	[TOKEN_SYMBOLS.STABLECOINS.USDC]: 1.0,
	[TOKEN_SYMBOLS.STABLECOINS.USDT]: 1.0,
	[TOKEN_SYMBOLS.STABLECOINS.MDAI]: 1.0,
	[TOKEN_SYMBOLS.STABLECOINS.MUSDC]: 1.0,
	[TOKEN_SYMBOLS.STABLECOINS.MUSDT]: 1.0,
	[TOKEN_SYMBOLS.NATIVE.ETH]: 3000,
	[TOKEN_SYMBOLS.NATIVE.WETH]: 3000,
} as const;

/**
 * Display format constants
 */
export const DISPLAY_FORMATS = {
	/** Currency format options */
	CURRENCY: {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: FORMATTING_THRESHOLDS.CURRENCY_DECIMALS,
		maximumFractionDigits: FORMATTING_THRESHOLDS.CURRENCY_DECIMALS,
	},
	/** Compact number format options */
	COMPACT: {
		notation: 'compact' as const,
		maximumFractionDigits: FORMATTING_THRESHOLDS.COMPACT_DECIMALS,
	},
	/** Percentage format options */
	PERCENTAGE: {
		style: 'percent',
		minimumFractionDigits: 0,
		maximumFractionDigits: FORMATTING_THRESHOLDS.PERCENTAGE_DECIMALS,
	},
} as const;
