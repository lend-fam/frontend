export const MARKET_QUERY_CONFIG = {
	MARKET_INFO: {
		staleTime: 300_000, // 5 minutes - Market info changes rarely
		refetchInterval: 300_000,
	},

	MARKET_RATES: {
		staleTime: 60_000, // 1 minute - Rates update more frequently
		refetchInterval: 120_000, // 2 minutes
	},

	USER_POSITIONS: {
		staleTime: 30_000, // 30 seconds - User data should be fresh
		refetchInterval: 60_000, // 1 minute
	},

	ACCOUNT_LIQUIDITY: {
		staleTime: 30_000, // 30 seconds - Critical for UI but not real-time
		refetchInterval: 60_000, // 1 minute
		refetchOnWindowFocus: false, // Disable aggressive focus refetching
		retry: 2, // Reduce retries
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 2000),
	},

	MARKET_LIQUIDITY: {
		staleTime: 120_000, // 2 minutes - Liquidity changes slowly
		refetchInterval: 180_000, // 3 minutes
	},

	WALLET_BALANCES: {
		staleTime: 60_000, // 1 minute - Wallet balances don't change frequently
		refetchOnWindowFocus: false, // Prevent aggressive refetching on focus
		refetchOnMount: false, // Prevent refetch on component remount
	},

	TOKEN_METADATA: {
		staleTime: 300_000, // 5 minutes - Token metadata is static
		refetchInterval: false, // Never auto-refetch metadata
		refetchOnWindowFocus: false,
	},
} as const;

export const CRITICAL_QUERY_RETRY = {
	retry: 3,
	retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 3000),
} as const;
