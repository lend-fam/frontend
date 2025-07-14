export const MARKET_QUERY_CONFIG = {
	MARKET_INFO: {
		staleTime: 60000,
		refetchInterval: 60000,
	},

	MARKET_RATES: {
		staleTime: 30000,
		refetchInterval: 30000,
	},

	USER_POSITIONS: {
		staleTime: 10000,
		refetchInterval: 10000,
	},

	ACCOUNT_LIQUIDITY: {
		staleTime: 5000,
		refetchInterval: 10000,
		refetchOnWindowFocus: true,
		retry: 3,
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 3000),
	},

	MARKET_LIQUIDITY: {
		staleTime: 30000,
		refetchInterval: 30000,
	},
} as const;

export const CRITICAL_QUERY_RETRY = {
	retry: 3,
	retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 3000),
} as const;
