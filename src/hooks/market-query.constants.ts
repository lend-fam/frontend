/**
 * Shared constants and configurations for market-related queries
 */

/**
 * Query configuration constants for different types of market data
 */
export const MARKET_QUERY_CONFIG = {
	// Basic market information - updated less frequently
	MARKET_INFO: {
		staleTime: 60000, // 1 minute
		refetchInterval: 60000,
	},

	// Market rates and APY data - updated moderately frequently
	MARKET_RATES: {
		staleTime: 30000, // 30 seconds
		refetchInterval: 30000,
	},

	// User positions and balances - updated frequently
	USER_POSITIONS: {
		staleTime: 10000, // 10 seconds
		refetchInterval: 10000,
	},

	// Account liquidity - critical data, minimal caching
	ACCOUNT_LIQUIDITY: {
		staleTime: 5000, // 5 seconds
		refetchInterval: false,
		retry: 3,
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 3000),
	},

	// Market liquidity data - moderate frequency
	MARKET_LIQUIDITY: {
		staleTime: 30000, // 30 seconds
		refetchInterval: 30000,
	},
} as const;

/**
 * Default retry configuration for critical market operations
 */
export const CRITICAL_QUERY_RETRY = {
	retry: 3,
	retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 3000),
} as const;
