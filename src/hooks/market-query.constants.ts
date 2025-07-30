export const MARKET_QUERY_CONFIG = {
	// Static data - changes very rarely
	MARKET_INFO: {
		staleTime: 600_000, // 10 minutes - Market info changes rarely
		refetchInterval: 600_000, // 10 minutes
		refetchOnWindowFocus: false, // Prevent aggressive refetching
		refetchOnMount: false, // Don't refetch on component remount
		gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
	},

	// Dynamic pricing data - updates frequently
	MARKET_RATES: {
		staleTime: 30_000, // 30 seconds - Rates are critical and update frequently
		refetchInterval: 60_000, // 1 minute background refresh
		refetchOnWindowFocus: true, // Refetch on focus for fresh rates
		refetchOnMount: true, // Fresh data on mount
		gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
	},

	// User-specific data - needs to be fresh but not real-time
	USER_POSITIONS: {
		staleTime: 15_000, // 15 seconds - User data should be fresh
		refetchInterval: 30_000, // 30 seconds background refresh
		refetchOnWindowFocus: true, // Refetch on focus for user data
		refetchOnMount: true, // Fresh user data on mount
		gcTime: 2 * 60 * 1000, // 2 minutes garbage collection
	},

	// Critical financial data - needs to be very fresh
	ACCOUNT_LIQUIDITY: {
		staleTime: 10_000, // 10 seconds - Critical for liquidation risk
		refetchInterval: 20_000, // 20 seconds background refresh
		refetchOnWindowFocus: true, // Always fresh on focus
		refetchOnMount: true, // Fresh data on mount
		retry: 3, // More retries for critical data
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 3000),
		gcTime: 1 * 60 * 1000, // 1 minute garbage collection
	},

	// Market liquidity - medium volatility
	MARKET_LIQUIDITY: {
		staleTime: 60_000, // 1 minute - Liquidity changes moderately
		refetchInterval: 120_000, // 2 minutes background refresh
		refetchOnWindowFocus: false, // Not critical for immediate refresh
		gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
	},

	// Wallet balances - user-controlled, moderate refresh needs
	WALLET_BALANCES: {
		staleTime: 30_000, // 30 seconds - Balance changes from user actions
		refetchInterval: false, // No background refresh (user-controlled)
		refetchOnWindowFocus: true, // Refresh on focus to catch external changes
		refetchOnMount: true, // Fresh balances on mount
		gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
	},

	// Static metadata - rarely changes
	TOKEN_METADATA: {
		staleTime: 24 * 60 * 60 * 1000, // 24 hours - Metadata is very static
		refetchInterval: false, // Never auto-refetch metadata
		refetchOnWindowFocus: false, // Never refetch on focus
		refetchOnMount: false, // Don't refetch on mount
		gcTime: 60 * 60 * 1000, // 1 hour garbage collection
	},

	// High-frequency trading data - for charts and real-time displays
	REAL_TIME_RATES: {
		staleTime: 5_000, // 5 seconds - For real-time displays
		refetchInterval: 10_000, // 10 seconds background refresh
		refetchOnWindowFocus: true, // Always fresh on focus
		refetchOnMount: true, // Fresh data on mount
		gcTime: 30 * 1000, // 30 seconds garbage collection
	},

	// Transaction-related data - needs to be very fresh during tx flows
	TRANSACTION_DATA: {
		staleTime: 5_000, // 5 seconds - Critical during transactions
		refetchInterval: 15_000, // 15 seconds background refresh
		refetchOnWindowFocus: true, // Always fresh on focus
		refetchOnMount: true, // Fresh data on mount
		retry: 5, // More retries for transaction-critical data
		retryDelay: (attemptIndex: number) => Math.min(500 * 2 ** attemptIndex, 2000),
		gcTime: 30 * 1000, // 30 seconds garbage collection
	},
} as const;

export const CRITICAL_QUERY_RETRY = {
	retry: 3,
	retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 3000),
} as const;

// Optimized query configuration based on data volatility and user needs
export const OPTIMIZED_QUERY_CONFIG = {
	// Ultra-static data (contract addresses, ABIs, etc.)
	STATIC: {
		staleTime: Infinity, // Never stale
		refetchInterval: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		gcTime: 60 * 60 * 1000, // 1 hour
	},

	// Background data (not immediately visible)
	BACKGROUND: {
		staleTime: 300_000, // 5 minutes
		refetchInterval: 600_000, // 10 minutes
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		gcTime: 30 * 60 * 1000, // 30 minutes
	},

	// Prefetched data (warmed cache)
	PREFETCH: {
		staleTime: 60_000, // 1 minute
		refetchInterval: false, // Only prefetch, don't auto-refresh
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		gcTime: 5 * 60 * 1000, // 5 minutes
	},
} as const;

/**
 * Get optimized query config based on data type and usage context
 */
export function getOptimizedQueryConfig(
	dataType: keyof typeof MARKET_QUERY_CONFIG,
	context?: 'prefetch' | 'background' | 'critical',
) {
	const baseConfig = MARKET_QUERY_CONFIG[dataType];

	if (context === 'prefetch') {
		return {
			...baseConfig,
			...OPTIMIZED_QUERY_CONFIG.PREFETCH,
		};
	}

	if (context === 'background') {
		return {
			...baseConfig,
			...OPTIMIZED_QUERY_CONFIG.BACKGROUND,
		};
	}

	if (context === 'critical') {
		return {
			...baseConfig,
			staleTime: Math.min(baseConfig.staleTime || 30_000, 10_000), // Max 10s for critical
			refetchOnWindowFocus: true,
			refetchOnMount: true,
			...CRITICAL_QUERY_RETRY,
		};
	}

	return baseConfig;
}
