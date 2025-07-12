
// Re-export all focused hooks for backwards compatibility
export {
	useAllMarkets,
	useMarket,
	useMarketData,
	useUserMarkets,
	useMarketsWithData,
} from './use-market-core.hook';

export {
	useUserMarketPosition,
	useUserSupplyPositions,
	useUserBorrowPositions,
} from './use-user-positions.hook';

export {
	useMarketsAvailableLiquidity,
	useMarketsAPY,
	useMarketsExchangeRates,
	useMarketsCollateralFactors,
} from './use-market-data.hook';

export {
	useAccountLiquidity,
} from './use-account-liquidity.hook';

/**
 * @deprecated This file has been split into focused hooks for better maintainability.
 * All exports are re-exported for backwards compatibility.
 * 
 * For new code, please use the specific focused hooks:
 * - `use-market-core.hook.ts` - Basic market operations and data fetching
 * - `use-user-positions.hook.ts` - User supply/borrow positions and balances  
 * - `use-market-data.hook.ts` - APY, rates, liquidity data
 * - `use-account-liquidity.hook.ts` - Account-specific liquidity calculations
 */
