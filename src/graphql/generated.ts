import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: string; output: string; }
  Bytes: { input: string; output: string; }
  Int8: { input: number; output: number; }
  Timestamp: { input: number; output: number; }
};

export type ApyStats = {
  __typename?: 'APYStats';
  borrowAPY_first: Scalars['BigInt']['output'];
  borrowAPY_last: Scalars['BigInt']['output'];
  borrowAPY_max: Scalars['BigInt']['output'];
  borrowAPY_min: Scalars['BigInt']['output'];
  cTokenMarket: Scalars['String']['output'];
  dataPoints: Scalars['BigInt']['output'];
  exchangeRate_first: Scalars['BigInt']['output'];
  exchangeRate_last: Scalars['BigInt']['output'];
  exchangeRate_max: Scalars['BigInt']['output'];
  exchangeRate_min: Scalars['BigInt']['output'];
  id: Scalars['Int8']['output'];
  interval: Scalars['String']['output'];
  supplyAPY_first: Scalars['BigInt']['output'];
  supplyAPY_last: Scalars['BigInt']['output'];
  supplyAPY_max: Scalars['BigInt']['output'];
  supplyAPY_min: Scalars['BigInt']['output'];
  timestamp: Scalars['Timestamp']['output'];
  totalBorrows_first: Scalars['BigInt']['output'];
  totalBorrows_last: Scalars['BigInt']['output'];
  totalBorrows_max: Scalars['BigInt']['output'];
  totalBorrows_min: Scalars['BigInt']['output'];
  totalSupply_first: Scalars['BigInt']['output'];
  totalSupply_last: Scalars['BigInt']['output'];
  totalSupply_max: Scalars['BigInt']['output'];
  totalSupply_min: Scalars['BigInt']['output'];
  utilizationRate_first: Scalars['BigInt']['output'];
  utilizationRate_last: Scalars['BigInt']['output'];
  utilizationRate_max: Scalars['BigInt']['output'];
  utilizationRate_min: Scalars['BigInt']['output'];
};

export type Account = {
  __typename?: 'Account';
  accountSubsidies: Array<AccountVaultSubsidy>;
  createdAtBlock: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  markets: Array<AccountMarket>;
  totalCollectionsParticipated: Scalars['BigInt']['output'];
  totalNFTsOwned: Scalars['BigInt']['output'];
  totalSecondsClaimed: Scalars['BigInt']['output'];
  updatedAtBlock: Scalars['BigInt']['output'];
  updatedAtTimestamp: Scalars['BigInt']['output'];
};

export type AccountCollectionSubsidy = {
  __typename?: 'AccountCollectionSubsidy';
  account: Account;
  accountVaultSubsidy: AccountVaultSubsidy;
  collection: Collection;
  collectionVaultSubsidy: CollectionVaultSubsidy;
  createdAtBlock: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  lastEffectiveValue: Scalars['BigInt']['output'];
  secondsAccumulated: Scalars['BigInt']['output'];
  secondsClaimed: Scalars['BigInt']['output'];
  subsidiesAccrued: Scalars['BigInt']['output'];
  subsidiesClaimed: Scalars['BigInt']['output'];
  updatedAtBlock: Scalars['BigInt']['output'];
  updatedAtTimestamp: Scalars['BigInt']['output'];
  vault: MarketVault;
};

export type AccountMarket = {
  __typename?: 'AccountMarket';
  account: Account;
  borrowBalance: Scalars['BigInt']['output'];
  cTokenMarket: CTokenMarket;
  createdAtBlock: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  supplyBalance: Scalars['BigInt']['output'];
  updatedAtBlock: Scalars['BigInt']['output'];
  updatedAtTimestamp: Scalars['BigInt']['output'];
};

export type AccountVaultSubsidy = {
  __typename?: 'AccountVaultSubsidy';
  account: Account;
  accountCollectionSubsidies: Array<AccountCollectionSubsidy>;
  accountMarket: AccountMarket;
  createdAtBlock: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  lastEffectiveValue: Scalars['BigInt']['output'];
  secondsAccumulated: Scalars['BigInt']['output'];
  secondsClaimed: Scalars['BigInt']['output'];
  subsidiesAccrued: Scalars['BigInt']['output'];
  subsidiesClaimed: Scalars['BigInt']['output'];
  updatedAtBlock: Scalars['BigInt']['output'];
  updatedAtTimestamp: Scalars['BigInt']['output'];
  vault: MarketVault;
};

export type CTokenApyData = {
  __typename?: 'CTokenAPYData';
  baseRatePerBlock: Scalars['BigInt']['output'];
  blockNumber: Scalars['BigInt']['output'];
  borrowAPY: Scalars['BigInt']['output'];
  cTokenMarket: Scalars['String']['output'];
  exchangeRate: Scalars['BigInt']['output'];
  id: Scalars['Int8']['output'];
  interval: Scalars['String']['output'];
  jumpMultiplierPerBlock: Scalars['BigInt']['output'];
  kink: Scalars['BigInt']['output'];
  multiplierPerBlock: Scalars['BigInt']['output'];
  supplyAPY: Scalars['BigInt']['output'];
  timestamp: Scalars['Timestamp']['output'];
  totalBorrows: Scalars['BigInt']['output'];
  totalSupply: Scalars['BigInt']['output'];
  transactionHash: Scalars['Bytes']['output'];
  utilizationRate: Scalars['BigInt']['output'];
};

export type CTokenApyDataFilter = {
  cTokenMarket?: InputMaybe<Scalars['String']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
};

export type CTokenMarket = {
  __typename?: 'CTokenMarket';
  accountMarkets: Array<AccountMarket>;
  baseRatePerBlock: Scalars['BigInt']['output'];
  borrowIndex: Scalars['BigInt']['output'];
  collateralFactor: Scalars['BigInt']['output'];
  createdAtBlock: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  decimals: Scalars['Int']['output'];
  exchangeRate: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  jumpMultiplierPerBlock: Scalars['BigInt']['output'];
  kink: Scalars['BigInt']['output'];
  multiplierPerBlock: Scalars['BigInt']['output'];
  name: Scalars['String']['output'];
  reserveFactor: Scalars['BigInt']['output'];
  symbol: Scalars['String']['output'];
  totalBorrows: Scalars['BigInt']['output'];
  totalReserves: Scalars['BigInt']['output'];
  totalSupply: Scalars['BigInt']['output'];
  updatedAtBlock: Scalars['BigInt']['output'];
  updatedAtTimestamp: Scalars['BigInt']['output'];
  vaults: Array<MarketVault>;
};

export type CTokenMarketFilter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  symbol?: InputMaybe<Scalars['String']['input']>;
};

export type Collection = {
  __typename?: 'Collection';
  collectionType: CollectionType;
  collectionVaultSubsidies: Array<CollectionVaultSubsidy>;
  contractAddress: Scalars['Bytes']['output'];
  createdAtBlock: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  registry: CollectionRegistry;
  symbol: Scalars['String']['output'];
  totalSupply: Scalars['BigInt']['output'];
  updatedAtBlock: Scalars['BigInt']['output'];
  updatedAtTimestamp: Scalars['BigInt']['output'];
  weightFunctionP1: Scalars['BigInt']['output'];
  weightFunctionP2: Scalars['BigInt']['output'];
  weightFunctionType: WeightFunctionType;
  yieldSharePercentage: Scalars['BigInt']['output'];
};

export type CollectionRegistry = {
  __typename?: 'CollectionRegistry';
  collections: Array<Collection>;
  createdAtBlock: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  totalActiveCollections: Scalars['BigInt']['output'];
  totalCollections: Scalars['BigInt']['output'];
  updatedAtBlock: Scalars['BigInt']['output'];
  updatedAtTimestamp: Scalars['BigInt']['output'];
};

export enum CollectionType {
  Erc721 = 'ERC721',
  Erc1155 = 'ERC1155'
}

export type CollectionVaultSubsidy = {
  __typename?: 'CollectionVaultSubsidy';
  accountCollectionSubsidies: Array<AccountCollectionSubsidy>;
  collection: Collection;
  createdAtBlock: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  secondsAccumulated: Scalars['BigInt']['output'];
  secondsClaimed: Scalars['BigInt']['output'];
  subsidiesAccrued: Scalars['BigInt']['output'];
  subsidiesClaimed: Scalars['BigInt']['output'];
  updatedAtBlock: Scalars['BigInt']['output'];
  updatedAtTimestamp: Scalars['BigInt']['output'];
  vault: MarketVault;
};

export type DebtSubsidizer = {
  __typename?: 'DebtSubsidizer';
  createdAtBlock: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  subsidyDistributions: Array<SubsidyDistribution>;
  totalSubsidiesDistributed: Scalars['BigInt']['output'];
  updatedAtBlock: Scalars['BigInt']['output'];
  updatedAtTimestamp: Scalars['BigInt']['output'];
  vaults: Array<MarketVault>;
};

export type Epoch = {
  __typename?: 'Epoch';
  createdAtBlock: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  endTimestamp: Scalars['BigInt']['output'];
  epochManager: EpochManager;
  epochNumber: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  processingCompletedTimestamp?: Maybe<Scalars['BigInt']['output']>;
  processingGasUsed?: Maybe<Scalars['BigInt']['output']>;
  processingStartedTimestamp?: Maybe<Scalars['BigInt']['output']>;
  processingTimeMs?: Maybe<Scalars['BigInt']['output']>;
  processingTransactionCount?: Maybe<Scalars['BigInt']['output']>;
  remainingYield: Scalars['BigInt']['output'];
  startTimestamp: Scalars['BigInt']['output'];
  status: EpochStatus;
  subsidyDistributions: Array<SubsidyDistribution>;
  totalEligibleUsers: Scalars['BigInt']['output'];
  totalParticipatingCollections: Scalars['BigInt']['output'];
  totalSubsidiesDistributed: Scalars['BigInt']['output'];
  totalYieldAllocated: Scalars['BigInt']['output'];
  totalYieldAvailable: Scalars['BigInt']['output'];
  totalYieldDistributed: Scalars['BigInt']['output'];
  updatedAtBlock: Scalars['BigInt']['output'];
  updatedAtTimestamp: Scalars['BigInt']['output'];
};

export type EpochManager = {
  __typename?: 'EpochManager';
  createdAtBlock: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  currentEpoch: Epoch;
  currentEpochId: Scalars['BigInt']['output'];
  epochs: Array<Epoch>;
  id: Scalars['ID']['output'];
  updatedAtBlock: Scalars['BigInt']['output'];
  updatedAtTimestamp: Scalars['BigInt']['output'];
  vault: MarketVault;
};

export enum EpochStatus {
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
  Failed = 'FAILED'
}

export type LendingManager = {
  __typename?: 'LendingManager';
  createdAtBlock: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  totalMarketParticipants: Scalars['BigInt']['output'];
  updatedAtBlock: Scalars['BigInt']['output'];
  updatedAtTimestamp: Scalars['BigInt']['output'];
  vault: MarketVault;
};

export type MarketVault = {
  __typename?: 'MarketVault';
  accountVaultSubsidies: Array<AccountVaultSubsidy>;
  cTokenMarket: CTokenMarket;
  collectionRegistry: CollectionRegistry;
  collectionVaultSubsidies: Array<CollectionVaultSubsidy>;
  createdAtBlock: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  debtSubsidizer: DebtSubsidizer;
  globalDepositIndex: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  lendingManager: LendingManager;
  secondsAccumulated: Scalars['BigInt']['output'];
  secondsClaimed: Scalars['BigInt']['output'];
  subsidiesAccrued: Scalars['BigInt']['output'];
  subsidiesClaimed: Scalars['BigInt']['output'];
  totalCTokens: Scalars['BigInt']['output'];
  totalPrincipalDeposited: Scalars['BigInt']['output'];
  totalShares: Scalars['BigInt']['output'];
  updatedAtBlock: Scalars['BigInt']['output'];
  updatedAtTimestamp: Scalars['BigInt']['output'];
};

export type Query = {
  __typename?: 'Query';
  ctokenAPYDatas: Array<CTokenApyData>;
  ctokenMarket?: Maybe<CTokenMarket>;
  ctokenMarkets: Array<CTokenMarket>;
};


export type QueryCtokenApyDatasArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<CTokenApyDataFilter>;
};


export type QueryCtokenMarketArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCtokenMarketsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<CTokenMarketFilter>;
};

export type SubsidyDistribution = {
  __typename?: 'SubsidyDistribution';
  borrowAmountAfter: Scalars['BigInt']['output'];
  borrowAmountBefore: Scalars['BigInt']['output'];
  collection: Collection;
  createdAtBlock: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  debtSubsidizer: DebtSubsidizer;
  epoch: Epoch;
  id: Scalars['ID']['output'];
  nftBalance: Scalars['BigInt']['output'];
  subsidyAmount: Scalars['BigInt']['output'];
  updatedAtBlock: Scalars['BigInt']['output'];
  updatedAtTimestamp: Scalars['BigInt']['output'];
  user: Account;
  vault: MarketVault;
  weightedContribution: Scalars['BigInt']['output'];
};

export type Timestamped = {
  createdAtBlock: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  updatedAtBlock: Scalars['BigInt']['output'];
  updatedAtTimestamp: Scalars['BigInt']['output'];
};

export enum WeightFunctionType {
  Exponential = 'EXPONENTIAL',
  Linear = 'LINEAR'
}

export type GetSimpleApyStatsQueryVariables = Exact<{
  cTokenMarket: Scalars['String']['input'];
}>;


export type GetSimpleApyStatsQuery = { __typename?: 'Query', ctokenAPYDatas: Array<{ __typename?: 'CTokenAPYData', id: number, timestamp: number, cTokenMarket: string, interval: string, supplyAPY: string, borrowAPY: string, utilizationRate: string, totalSupply: string, totalBorrows: string, exchangeRate: string, blockNumber: string }> };

export type GetAllApyStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllApyStatsQuery = { __typename?: 'Query', ctokenAPYDatas: Array<{ __typename?: 'CTokenAPYData', id: number, timestamp: number, cTokenMarket: string, interval: string, supplyAPY: string, borrowAPY: string, utilizationRate: string, totalSupply: string, totalBorrows: string, exchangeRate: string, blockNumber: string }> };

export type GetCTokenMarketsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCTokenMarketsQuery = { __typename?: 'Query', ctokenMarkets: Array<{ __typename?: 'CTokenMarket', id: string, symbol: string, name: string, decimals: number, totalSupply: string, totalBorrows: string, exchangeRate: string }> };

export type GetHistoricalApyQueryVariables = Exact<{
  cTokenMarket: Scalars['String']['input'];
  from: Scalars['Int']['input'];
  to: Scalars['Int']['input'];
  interval: Scalars['String']['input'];
}>;


export type GetHistoricalApyQuery = { __typename?: 'Query', ctokenAPYDatas: Array<{ __typename?: 'CTokenAPYData', id: number, timestamp: number, cTokenMarket: string, interval: string, supplyAPY: string, borrowAPY: string, utilizationRate: string, totalSupply: string, totalBorrows: string, exchangeRate: string, blockNumber: string }> };

export type GetLatestApyStatsQueryVariables = Exact<{
  cTokenMarket: Scalars['String']['input'];
}>;


export type GetLatestApyStatsQuery = { __typename?: 'Query', ctokenAPYDatas: Array<{ __typename?: 'CTokenAPYData', id: number, timestamp: number, cTokenMarket: string, interval: string, supplyAPY: string, borrowAPY: string, utilizationRate: string, totalSupply: string, totalBorrows: string, exchangeRate: string, blockNumber: string }> };

export type GetCTokenApyDataQueryVariables = Exact<{
  cTokenMarket: Scalars['String']['input'];
  from: Scalars['Int']['input'];
  to: Scalars['Int']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetCTokenApyDataQuery = { __typename?: 'Query', ctokenAPYDatas: Array<{ __typename?: 'CTokenAPYData', id: number, timestamp: number, cTokenMarket: string, interval: string, supplyAPY: string, borrowAPY: string, utilizationRate: string, totalSupply: string, totalBorrows: string, exchangeRate: string, blockNumber: string, transactionHash: string }> };

export type GetMarketOverviewQueryVariables = Exact<{
  cTokenMarket: Scalars['ID']['input'];
}>;


export type GetMarketOverviewQuery = { __typename?: 'Query', ctokenMarket?: { __typename?: 'CTokenMarket', id: string, symbol: string, name: string, decimals: number, totalSupply: string, totalBorrows: string, totalReserves: string, exchangeRate: string, borrowIndex: string, collateralFactor: string, reserveFactor: string, baseRatePerBlock: string, multiplierPerBlock: string, jumpMultiplierPerBlock: string, kink: string, createdAtTimestamp: string, updatedAtTimestamp: string } | null };

export type GetCTokenApyDataDebugQueryVariables = Exact<{
  cTokenMarket: Scalars['String']['input'];
}>;


export type GetCTokenApyDataDebugQuery = { __typename?: 'Query', ctokenAPYDatas: Array<{ __typename?: 'CTokenAPYData', id: number, timestamp: number, cTokenMarket: string, interval: string, supplyAPY: string, borrowAPY: string, utilizationRate: string, totalSupply: string, totalBorrows: string, exchangeRate: string, blockNumber: string }> };

export type TestSubgraphQueryVariables = Exact<{ [key: string]: never; }>;


export type TestSubgraphQuery = { __typename?: 'Query', ctokenAPYDatas: Array<{ __typename?: 'CTokenAPYData', id: number, timestamp: number, cTokenMarket: string, interval: string, supplyAPY: string, borrowAPY: string, utilizationRate: string, totalSupply: string, totalBorrows: string, exchangeRate: string, blockNumber: string }> };


export const GetSimpleApyStatsDocument = gql`
    query GetSimpleAPYStats($cTokenMarket: String!) {
  ctokenAPYDatas(
    where: {cTokenMarket: $cTokenMarket}
    orderBy: "timestamp"
    orderDirection: "desc"
    first: 10
  ) {
    id
    timestamp
    cTokenMarket
    interval
    supplyAPY
    borrowAPY
    utilizationRate
    totalSupply
    totalBorrows
    exchangeRate
    blockNumber
  }
}
    `;

/**
 * __useGetSimpleApyStatsQuery__
 *
 * To run a query within a React component, call `useGetSimpleApyStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSimpleApyStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSimpleApyStatsQuery({
 *   variables: {
 *      cTokenMarket: // value for 'cTokenMarket'
 *   },
 * });
 */
export function useGetSimpleApyStatsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetSimpleApyStatsQuery, GetSimpleApyStatsQueryVariables> & ({ variables: GetSimpleApyStatsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetSimpleApyStatsQuery, GetSimpleApyStatsQueryVariables>(GetSimpleApyStatsDocument, options);
      }
export function useGetSimpleApyStatsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetSimpleApyStatsQuery, GetSimpleApyStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetSimpleApyStatsQuery, GetSimpleApyStatsQueryVariables>(GetSimpleApyStatsDocument, options);
        }
export function useGetSimpleApyStatsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetSimpleApyStatsQuery, GetSimpleApyStatsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetSimpleApyStatsQuery, GetSimpleApyStatsQueryVariables>(GetSimpleApyStatsDocument, options);
        }
export type GetSimpleApyStatsQueryHookResult = ReturnType<typeof useGetSimpleApyStatsQuery>;
export type GetSimpleApyStatsLazyQueryHookResult = ReturnType<typeof useGetSimpleApyStatsLazyQuery>;
export type GetSimpleApyStatsSuspenseQueryHookResult = ReturnType<typeof useGetSimpleApyStatsSuspenseQuery>;
export type GetSimpleApyStatsQueryResult = ApolloReactCommon.QueryResult<GetSimpleApyStatsQuery, GetSimpleApyStatsQueryVariables>;
export const GetAllApyStatsDocument = gql`
    query GetAllAPYStats {
  ctokenAPYDatas(first: 5, orderBy: "timestamp", orderDirection: "desc") {
    id
    timestamp
    cTokenMarket
    interval
    supplyAPY
    borrowAPY
    utilizationRate
    totalSupply
    totalBorrows
    exchangeRate
    blockNumber
  }
}
    `;

/**
 * __useGetAllApyStatsQuery__
 *
 * To run a query within a React component, call `useGetAllApyStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllApyStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllApyStatsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllApyStatsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetAllApyStatsQuery, GetAllApyStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetAllApyStatsQuery, GetAllApyStatsQueryVariables>(GetAllApyStatsDocument, options);
      }
export function useGetAllApyStatsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetAllApyStatsQuery, GetAllApyStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetAllApyStatsQuery, GetAllApyStatsQueryVariables>(GetAllApyStatsDocument, options);
        }
export function useGetAllApyStatsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetAllApyStatsQuery, GetAllApyStatsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetAllApyStatsQuery, GetAllApyStatsQueryVariables>(GetAllApyStatsDocument, options);
        }
export type GetAllApyStatsQueryHookResult = ReturnType<typeof useGetAllApyStatsQuery>;
export type GetAllApyStatsLazyQueryHookResult = ReturnType<typeof useGetAllApyStatsLazyQuery>;
export type GetAllApyStatsSuspenseQueryHookResult = ReturnType<typeof useGetAllApyStatsSuspenseQuery>;
export type GetAllApyStatsQueryResult = ApolloReactCommon.QueryResult<GetAllApyStatsQuery, GetAllApyStatsQueryVariables>;
export const GetCTokenMarketsDocument = gql`
    query GetCTokenMarkets {
  ctokenMarkets(first: 5) {
    id
    symbol
    name
    decimals
    totalSupply
    totalBorrows
    exchangeRate
  }
}
    `;

/**
 * __useGetCTokenMarketsQuery__
 *
 * To run a query within a React component, call `useGetCTokenMarketsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCTokenMarketsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCTokenMarketsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCTokenMarketsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetCTokenMarketsQuery, GetCTokenMarketsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetCTokenMarketsQuery, GetCTokenMarketsQueryVariables>(GetCTokenMarketsDocument, options);
      }
export function useGetCTokenMarketsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetCTokenMarketsQuery, GetCTokenMarketsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetCTokenMarketsQuery, GetCTokenMarketsQueryVariables>(GetCTokenMarketsDocument, options);
        }
export function useGetCTokenMarketsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetCTokenMarketsQuery, GetCTokenMarketsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetCTokenMarketsQuery, GetCTokenMarketsQueryVariables>(GetCTokenMarketsDocument, options);
        }
export type GetCTokenMarketsQueryHookResult = ReturnType<typeof useGetCTokenMarketsQuery>;
export type GetCTokenMarketsLazyQueryHookResult = ReturnType<typeof useGetCTokenMarketsLazyQuery>;
export type GetCTokenMarketsSuspenseQueryHookResult = ReturnType<typeof useGetCTokenMarketsSuspenseQuery>;
export type GetCTokenMarketsQueryResult = ApolloReactCommon.QueryResult<GetCTokenMarketsQuery, GetCTokenMarketsQueryVariables>;
export const GetHistoricalApyDocument = gql`
    query GetHistoricalAPY($cTokenMarket: String!, $from: Int!, $to: Int!, $interval: String!) {
  ctokenAPYDatas(
    where: {cTokenMarket: $cTokenMarket, timestamp_gte: $from, timestamp_lte: $to}
    orderBy: "timestamp"
    orderDirection: "asc"
  ) {
    id
    timestamp
    cTokenMarket
    interval
    supplyAPY
    borrowAPY
    utilizationRate
    totalSupply
    totalBorrows
    exchangeRate
    blockNumber
  }
}
    `;

/**
 * __useGetHistoricalApyQuery__
 *
 * To run a query within a React component, call `useGetHistoricalApyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHistoricalApyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHistoricalApyQuery({
 *   variables: {
 *      cTokenMarket: // value for 'cTokenMarket'
 *      from: // value for 'from'
 *      to: // value for 'to'
 *      interval: // value for 'interval'
 *   },
 * });
 */
export function useGetHistoricalApyQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetHistoricalApyQuery, GetHistoricalApyQueryVariables> & ({ variables: GetHistoricalApyQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetHistoricalApyQuery, GetHistoricalApyQueryVariables>(GetHistoricalApyDocument, options);
      }
export function useGetHistoricalApyLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetHistoricalApyQuery, GetHistoricalApyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetHistoricalApyQuery, GetHistoricalApyQueryVariables>(GetHistoricalApyDocument, options);
        }
export function useGetHistoricalApySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetHistoricalApyQuery, GetHistoricalApyQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetHistoricalApyQuery, GetHistoricalApyQueryVariables>(GetHistoricalApyDocument, options);
        }
export type GetHistoricalApyQueryHookResult = ReturnType<typeof useGetHistoricalApyQuery>;
export type GetHistoricalApyLazyQueryHookResult = ReturnType<typeof useGetHistoricalApyLazyQuery>;
export type GetHistoricalApySuspenseQueryHookResult = ReturnType<typeof useGetHistoricalApySuspenseQuery>;
export type GetHistoricalApyQueryResult = ApolloReactCommon.QueryResult<GetHistoricalApyQuery, GetHistoricalApyQueryVariables>;
export const GetLatestApyStatsDocument = gql`
    query GetLatestAPYStats($cTokenMarket: String!) {
  ctokenAPYDatas(
    where: {cTokenMarket: $cTokenMarket}
    orderBy: "timestamp"
    orderDirection: "desc"
    first: 1
  ) {
    id
    timestamp
    cTokenMarket
    interval
    supplyAPY
    borrowAPY
    utilizationRate
    totalSupply
    totalBorrows
    exchangeRate
    blockNumber
  }
}
    `;

/**
 * __useGetLatestApyStatsQuery__
 *
 * To run a query within a React component, call `useGetLatestApyStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLatestApyStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLatestApyStatsQuery({
 *   variables: {
 *      cTokenMarket: // value for 'cTokenMarket'
 *   },
 * });
 */
export function useGetLatestApyStatsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetLatestApyStatsQuery, GetLatestApyStatsQueryVariables> & ({ variables: GetLatestApyStatsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetLatestApyStatsQuery, GetLatestApyStatsQueryVariables>(GetLatestApyStatsDocument, options);
      }
export function useGetLatestApyStatsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetLatestApyStatsQuery, GetLatestApyStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetLatestApyStatsQuery, GetLatestApyStatsQueryVariables>(GetLatestApyStatsDocument, options);
        }
export function useGetLatestApyStatsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetLatestApyStatsQuery, GetLatestApyStatsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetLatestApyStatsQuery, GetLatestApyStatsQueryVariables>(GetLatestApyStatsDocument, options);
        }
export type GetLatestApyStatsQueryHookResult = ReturnType<typeof useGetLatestApyStatsQuery>;
export type GetLatestApyStatsLazyQueryHookResult = ReturnType<typeof useGetLatestApyStatsLazyQuery>;
export type GetLatestApyStatsSuspenseQueryHookResult = ReturnType<typeof useGetLatestApyStatsSuspenseQuery>;
export type GetLatestApyStatsQueryResult = ApolloReactCommon.QueryResult<GetLatestApyStatsQuery, GetLatestApyStatsQueryVariables>;
export const GetCTokenApyDataDocument = gql`
    query GetCTokenAPYData($cTokenMarket: String!, $from: Int!, $to: Int!, $first: Int = 1000) {
  ctokenAPYDatas(
    where: {cTokenMarket: $cTokenMarket, timestamp_gte: $from, timestamp_lte: $to}
    orderBy: "timestamp"
    orderDirection: "asc"
    first: $first
  ) {
    id
    timestamp
    cTokenMarket
    interval
    supplyAPY
    borrowAPY
    utilizationRate
    totalSupply
    totalBorrows
    exchangeRate
    blockNumber
    transactionHash
  }
}
    `;

/**
 * __useGetCTokenApyDataQuery__
 *
 * To run a query within a React component, call `useGetCTokenApyDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCTokenApyDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCTokenApyDataQuery({
 *   variables: {
 *      cTokenMarket: // value for 'cTokenMarket'
 *      from: // value for 'from'
 *      to: // value for 'to'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useGetCTokenApyDataQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetCTokenApyDataQuery, GetCTokenApyDataQueryVariables> & ({ variables: GetCTokenApyDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetCTokenApyDataQuery, GetCTokenApyDataQueryVariables>(GetCTokenApyDataDocument, options);
      }
export function useGetCTokenApyDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetCTokenApyDataQuery, GetCTokenApyDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetCTokenApyDataQuery, GetCTokenApyDataQueryVariables>(GetCTokenApyDataDocument, options);
        }
export function useGetCTokenApyDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetCTokenApyDataQuery, GetCTokenApyDataQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetCTokenApyDataQuery, GetCTokenApyDataQueryVariables>(GetCTokenApyDataDocument, options);
        }
export type GetCTokenApyDataQueryHookResult = ReturnType<typeof useGetCTokenApyDataQuery>;
export type GetCTokenApyDataLazyQueryHookResult = ReturnType<typeof useGetCTokenApyDataLazyQuery>;
export type GetCTokenApyDataSuspenseQueryHookResult = ReturnType<typeof useGetCTokenApyDataSuspenseQuery>;
export type GetCTokenApyDataQueryResult = ApolloReactCommon.QueryResult<GetCTokenApyDataQuery, GetCTokenApyDataQueryVariables>;
export const GetMarketOverviewDocument = gql`
    query GetMarketOverview($cTokenMarket: ID!) {
  ctokenMarket(id: $cTokenMarket) {
    id
    symbol
    name
    decimals
    totalSupply
    totalBorrows
    totalReserves
    exchangeRate
    borrowIndex
    collateralFactor
    reserveFactor
    baseRatePerBlock
    multiplierPerBlock
    jumpMultiplierPerBlock
    kink
    createdAtTimestamp
    updatedAtTimestamp
  }
}
    `;

/**
 * __useGetMarketOverviewQuery__
 *
 * To run a query within a React component, call `useGetMarketOverviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMarketOverviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMarketOverviewQuery({
 *   variables: {
 *      cTokenMarket: // value for 'cTokenMarket'
 *   },
 * });
 */
export function useGetMarketOverviewQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetMarketOverviewQuery, GetMarketOverviewQueryVariables> & ({ variables: GetMarketOverviewQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetMarketOverviewQuery, GetMarketOverviewQueryVariables>(GetMarketOverviewDocument, options);
      }
export function useGetMarketOverviewLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetMarketOverviewQuery, GetMarketOverviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetMarketOverviewQuery, GetMarketOverviewQueryVariables>(GetMarketOverviewDocument, options);
        }
export function useGetMarketOverviewSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetMarketOverviewQuery, GetMarketOverviewQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetMarketOverviewQuery, GetMarketOverviewQueryVariables>(GetMarketOverviewDocument, options);
        }
export type GetMarketOverviewQueryHookResult = ReturnType<typeof useGetMarketOverviewQuery>;
export type GetMarketOverviewLazyQueryHookResult = ReturnType<typeof useGetMarketOverviewLazyQuery>;
export type GetMarketOverviewSuspenseQueryHookResult = ReturnType<typeof useGetMarketOverviewSuspenseQuery>;
export type GetMarketOverviewQueryResult = ApolloReactCommon.QueryResult<GetMarketOverviewQuery, GetMarketOverviewQueryVariables>;
export const GetCTokenApyDataDebugDocument = gql`
    query GetCTokenAPYDataDebug($cTokenMarket: String!) {
  ctokenAPYDatas(
    where: {cTokenMarket: $cTokenMarket}
    orderBy: "timestamp"
    orderDirection: "desc"
    first: 50
  ) {
    id
    timestamp
    cTokenMarket
    interval
    supplyAPY
    borrowAPY
    utilizationRate
    totalSupply
    totalBorrows
    exchangeRate
    blockNumber
  }
}
    `;

/**
 * __useGetCTokenApyDataDebugQuery__
 *
 * To run a query within a React component, call `useGetCTokenApyDataDebugQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCTokenApyDataDebugQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCTokenApyDataDebugQuery({
 *   variables: {
 *      cTokenMarket: // value for 'cTokenMarket'
 *   },
 * });
 */
export function useGetCTokenApyDataDebugQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetCTokenApyDataDebugQuery, GetCTokenApyDataDebugQueryVariables> & ({ variables: GetCTokenApyDataDebugQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetCTokenApyDataDebugQuery, GetCTokenApyDataDebugQueryVariables>(GetCTokenApyDataDebugDocument, options);
      }
export function useGetCTokenApyDataDebugLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetCTokenApyDataDebugQuery, GetCTokenApyDataDebugQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetCTokenApyDataDebugQuery, GetCTokenApyDataDebugQueryVariables>(GetCTokenApyDataDebugDocument, options);
        }
export function useGetCTokenApyDataDebugSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetCTokenApyDataDebugQuery, GetCTokenApyDataDebugQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetCTokenApyDataDebugQuery, GetCTokenApyDataDebugQueryVariables>(GetCTokenApyDataDebugDocument, options);
        }
export type GetCTokenApyDataDebugQueryHookResult = ReturnType<typeof useGetCTokenApyDataDebugQuery>;
export type GetCTokenApyDataDebugLazyQueryHookResult = ReturnType<typeof useGetCTokenApyDataDebugLazyQuery>;
export type GetCTokenApyDataDebugSuspenseQueryHookResult = ReturnType<typeof useGetCTokenApyDataDebugSuspenseQuery>;
export type GetCTokenApyDataDebugQueryResult = ApolloReactCommon.QueryResult<GetCTokenApyDataDebugQuery, GetCTokenApyDataDebugQueryVariables>;
export const TestSubgraphDocument = gql`
    query TestSubgraph {
  ctokenAPYDatas(first: 5, orderBy: "timestamp", orderDirection: "desc") {
    id
    timestamp
    cTokenMarket
    interval
    supplyAPY
    borrowAPY
    utilizationRate
    totalSupply
    totalBorrows
    exchangeRate
    blockNumber
  }
}
    `;

/**
 * __useTestSubgraphQuery__
 *
 * To run a query within a React component, call `useTestSubgraphQuery` and pass it any options that fit your needs.
 * When your component renders, `useTestSubgraphQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTestSubgraphQuery({
 *   variables: {
 *   },
 * });
 */
export function useTestSubgraphQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<TestSubgraphQuery, TestSubgraphQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<TestSubgraphQuery, TestSubgraphQueryVariables>(TestSubgraphDocument, options);
      }
export function useTestSubgraphLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<TestSubgraphQuery, TestSubgraphQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<TestSubgraphQuery, TestSubgraphQueryVariables>(TestSubgraphDocument, options);
        }
export function useTestSubgraphSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<TestSubgraphQuery, TestSubgraphQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<TestSubgraphQuery, TestSubgraphQueryVariables>(TestSubgraphDocument, options);
        }
export type TestSubgraphQueryHookResult = ReturnType<typeof useTestSubgraphQuery>;
export type TestSubgraphLazyQueryHookResult = ReturnType<typeof useTestSubgraphLazyQuery>;
export type TestSubgraphSuspenseQueryHookResult = ReturnType<typeof useTestSubgraphSuspenseQuery>;
export type TestSubgraphQueryResult = ApolloReactCommon.QueryResult<TestSubgraphQuery, TestSubgraphQueryVariables>;