import type { Address } from 'viem';

export interface Market {
  address: Address;
  name: string;
  symbol: string;
  underlying?: Address;
  isListed: boolean;
  collateralFactorMantissa: bigint;
  isComped: boolean;
}

export interface MarketData extends Market {
  supplyAPY: string;
  borrowAPY: string;
  totalSupply: bigint;
  totalBorrows: bigint;
  exchangeRate: bigint;
  supplyRatePerBlock: bigint;
  borrowRatePerBlock: bigint;
}

export interface UserMarketPosition {
  market: Address;
  suppliedBalance: bigint;
  borrowedBalance: bigint;
  suppliedBalanceUSD: string;
  borrowedBalanceUSD: string;
  collateralEnabled: boolean;
}

export interface AccountLiquidity {
  error: bigint;
  liquidity: bigint;
  shortfall: bigint;
}