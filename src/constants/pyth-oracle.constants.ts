import type { Address } from 'viem';

// Pyth Oracle Error Types (from PythPriceOracle.sol)
export const PYTH_ORACLE_ERRORS = {
	Unauthorized: 'Unauthorized()',
	PriceNotAvailable: 'PriceNotAvailable()',
	PriceStale: 'PriceStale()',
	InvalidPriceFeedId: 'InvalidPriceFeedId()',
	InvalidPrice: 'InvalidPrice()',
} as const;

// Pyth Oracle Error Reasons
export type PythOracleErrorReason =
	| 'PYTH_ORACLE_UNAUTHORIZED'
	| 'PYTH_PRICE_NOT_AVAILABLE'
	| 'PYTH_PRICE_STALE'
	| 'PYTH_INVALID_PRICE_FEED'
	| 'PYTH_INVALID_PRICE'
	| 'PYTH_NETWORK_UNAVAILABLE'
	| 'PYTH_FALLBACK_ACTIVE';

// Error messages for user display
export const PYTH_ERROR_MESSAGES: Record<PythOracleErrorReason, string> = {
	PYTH_ORACLE_UNAUTHORIZED: 'Unauthorized oracle access',
	PYTH_PRICE_NOT_AVAILABLE: 'Price data unavailable',
	PYTH_PRICE_STALE: 'Price data is stale',
	PYTH_INVALID_PRICE_FEED: 'Invalid price feed configuration',
	PYTH_INVALID_PRICE: 'Invalid price data received',
	PYTH_NETWORK_UNAVAILABLE: 'Pyth Network unavailable',
	PYTH_FALLBACK_ACTIVE: 'Using fallback prices',
};

// Price source types
export type PriceSource = 'pyth' | 'fallback' | 'unavailable';

// Price source display labels
export const PRICE_SOURCE_LABELS: Record<PriceSource, string> = {
	pyth: 'Pyth Network',
	fallback: 'Fallback Price',
	unavailable: 'Price Unavailable',
};

// Price source status indicators
export const PRICE_SOURCE_STATUS: Record<PriceSource, { color: string; icon: string }> = {
	pyth: { color: '#22c55e', icon: '🔗' }, // Green - connected
	fallback: { color: '#f59e0b', icon: '⚠️' }, // Amber - warning
	unavailable: { color: '#ef4444', icon: '❌' }, // Red - error
};

// Pyth Network constants
export const PYTH_NETWORK = {
	// Pyth Network official contract addresses
	MAINNET_PYTH_ADDRESS: '0x4305FB66699C3B2702D4d05CF36551390A4c69C6' as Address,
	TESTNET_PYTH_ADDRESS: '0x4305FB66699C3B2702D4d05CF36551390A4c69C6' as Address,

	// Default price feed IDs (example - these should be configured per deployment)
	DEFAULT_PRICE_FEEDS: {
		// ETH/USD
		'0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE':
			'0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
		// These would be configured based on actual deployment
	} as Record<Address, string>,

	// Default max price age (5 minutes)
	DEFAULT_MAX_PRICE_AGE: 300,
} as const;

// Oracle type detection
export const ORACLE_TYPES = {
	SIMPLE: 'simple',
	PYTH: 'pyth',
	UNKNOWN: 'unknown',
} as const;

export type OracleType = (typeof ORACLE_TYPES)[keyof typeof ORACLE_TYPES];

// Oracle health status
export const ORACLE_HEALTH_STATUS = {
	HEALTHY: 'healthy',
	DEGRADED: 'degraded',
	UNAVAILABLE: 'unavailable',
} as const;

export type OracleHealthStatus = (typeof ORACLE_HEALTH_STATUS)[keyof typeof ORACLE_HEALTH_STATUS];

// Oracle health thresholds
export const ORACLE_HEALTH_THRESHOLDS = {
	// If price is older than this, consider degraded (in seconds)
	DEGRADED_AGE_THRESHOLD: 300, // 5 minutes
	// If price is older than this, consider unavailable (in seconds)
	UNAVAILABLE_AGE_THRESHOLD: 900, // 15 minutes
	// Minimum price value to consider valid
	MIN_VALID_PRICE: 0.000001,
} as const;
