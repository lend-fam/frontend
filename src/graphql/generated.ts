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
	ID: { input: string; output: string };
	String: { input: string; output: string };
	Boolean: { input: boolean; output: boolean };
	Int: { input: number; output: number };
	Float: { input: number; output: number };
	BigInt: { input: string; output: string };
	Bytes: { input: string; output: string };
	Int8: { input: number; output: number };
	Timestamp: { input: number; output: number };
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

export type ApyStatsFilter = {
	cTokenMarket?: InputMaybe<Scalars['String']['input']>;
	interval?: InputMaybe<Scalars['String']['input']>;
	timestamp_gte?: InputMaybe<Scalars['Timestamp']['input']>;
	timestamp_lte?: InputMaybe<Scalars['Timestamp']['input']>;
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
	timestamp_gte?: InputMaybe<Scalars['Timestamp']['input']>;
	timestamp_lte?: InputMaybe<Scalars['Timestamp']['input']>;
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
	Erc1155 = 'ERC1155',
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
	Failed = 'FAILED',
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
	apyStats: Array<ApyStats>;
	cTokenAPYData: Array<CTokenApyData>;
	cTokenMarket?: Maybe<CTokenMarket>;
};

export type QueryApyStatsArgs = {
	first?: InputMaybe<Scalars['Int']['input']>;
	orderBy?: InputMaybe<Scalars['String']['input']>;
	orderDirection?: InputMaybe<Scalars['String']['input']>;
	skip?: InputMaybe<Scalars['Int']['input']>;
	where?: InputMaybe<ApyStatsFilter>;
};

export type QueryCTokenApyDataArgs = {
	first?: InputMaybe<Scalars['Int']['input']>;
	orderBy?: InputMaybe<Scalars['String']['input']>;
	orderDirection?: InputMaybe<Scalars['String']['input']>;
	skip?: InputMaybe<Scalars['Int']['input']>;
	where?: InputMaybe<CTokenApyDataFilter>;
};

export type QueryCTokenMarketArgs = {
	id: Scalars['ID']['input'];
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
	Linear = 'LINEAR',
}

export type GetHistoricalApyQueryVariables = Exact<{
	cTokenMarket: Scalars['String']['input'];
	from: Scalars['Timestamp']['input'];
	to: Scalars['Timestamp']['input'];
	interval: Scalars['String']['input'];
}>;

export type GetHistoricalApyQuery = {
	__typename?: 'Query';
	apyStats: Array<{
		__typename?: 'APYStats';
		id: number;
		timestamp: number;
		cTokenMarket: string;
		interval: string;
		supplyAPY_last: string;
		borrowAPY_last: string;
		utilizationRate_last: string;
		totalSupply_last: string;
		totalBorrows_last: string;
		exchangeRate_last: string;
		dataPoints: string;
	}>;
};

export type GetLatestApyStatsQueryVariables = Exact<{
	cTokenMarket: Scalars['String']['input'];
}>;

export type GetLatestApyStatsQuery = {
	__typename?: 'Query';
	apyStats: Array<{
		__typename?: 'APYStats';
		id: number;
		timestamp: number;
		cTokenMarket: string;
		interval: string;
		supplyAPY_last: string;
		borrowAPY_last: string;
		utilizationRate_last: string;
		totalSupply_last: string;
		totalBorrows_last: string;
		exchangeRate_last: string;
	}>;
};

export type GetCTokenApyDataQueryVariables = Exact<{
	cTokenMarket: Scalars['String']['input'];
	from: Scalars['Timestamp']['input'];
	to: Scalars['Timestamp']['input'];
	first?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetCTokenApyDataQuery = {
	__typename?: 'Query';
	cTokenAPYData: Array<{
		__typename?: 'CTokenAPYData';
		id: number;
		timestamp: number;
		cTokenMarket: string;
		interval: string;
		supplyAPY: string;
		borrowAPY: string;
		utilizationRate: string;
		totalSupply: string;
		totalBorrows: string;
		exchangeRate: string;
		blockNumber: string;
		transactionHash: string;
	}>;
};

export type GetMarketOverviewQueryVariables = Exact<{
	cTokenMarket: Scalars['ID']['input'];
}>;

export type GetMarketOverviewQuery = {
	__typename?: 'Query';
	cTokenMarket?: {
		__typename?: 'CTokenMarket';
		id: string;
		symbol: string;
		name: string;
		decimals: number;
		totalSupply: string;
		totalBorrows: string;
		totalReserves: string;
		exchangeRate: string;
		borrowIndex: string;
		collateralFactor: string;
		reserveFactor: string;
		baseRatePerBlock: string;
		multiplierPerBlock: string;
		jumpMultiplierPerBlock: string;
		kink: string;
		createdAtTimestamp: string;
		updatedAtTimestamp: string;
	} | null;
};

export const GetHistoricalApyDocument = gql`
	query GetHistoricalAPY($cTokenMarket: String!, $from: Timestamp!, $to: Timestamp!, $interval: String!) {
		apyStats(
			where: { cTokenMarket: $cTokenMarket, interval: $interval, timestamp_gte: $from, timestamp_lte: $to }
			orderBy: "timestamp"
			orderDirection: "asc"
		) {
			id
			timestamp
			cTokenMarket
			interval
			supplyAPY_last
			borrowAPY_last
			utilizationRate_last
			totalSupply_last
			totalBorrows_last
			exchangeRate_last
			dataPoints
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
export function useGetHistoricalApyQuery(
	baseOptions: ApolloReactHooks.QueryHookOptions<GetHistoricalApyQuery, GetHistoricalApyQueryVariables> &
		({ variables: GetHistoricalApyQueryVariables; skip?: boolean } | { skip: boolean }),
) {
	const options = { ...defaultOptions, ...baseOptions };
	return ApolloReactHooks.useQuery<GetHistoricalApyQuery, GetHistoricalApyQueryVariables>(
		GetHistoricalApyDocument,
		options,
	);
}
export function useGetHistoricalApyLazyQuery(
	baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetHistoricalApyQuery, GetHistoricalApyQueryVariables>,
) {
	const options = { ...defaultOptions, ...baseOptions };
	return ApolloReactHooks.useLazyQuery<GetHistoricalApyQuery, GetHistoricalApyQueryVariables>(
		GetHistoricalApyDocument,
		options,
	);
}
export function useGetHistoricalApySuspenseQuery(
	baseOptions?:
		| ApolloReactHooks.SkipToken
		| ApolloReactHooks.SuspenseQueryHookOptions<GetHistoricalApyQuery, GetHistoricalApyQueryVariables>,
) {
	const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
	return ApolloReactHooks.useSuspenseQuery<GetHistoricalApyQuery, GetHistoricalApyQueryVariables>(
		GetHistoricalApyDocument,
		options,
	);
}
export type GetHistoricalApyQueryHookResult = ReturnType<typeof useGetHistoricalApyQuery>;
export type GetHistoricalApyLazyQueryHookResult = ReturnType<typeof useGetHistoricalApyLazyQuery>;
export type GetHistoricalApySuspenseQueryHookResult = ReturnType<typeof useGetHistoricalApySuspenseQuery>;
export type GetHistoricalApyQueryResult = ApolloReactCommon.QueryResult<
	GetHistoricalApyQuery,
	GetHistoricalApyQueryVariables
>;
export const GetLatestApyStatsDocument = gql`
	query GetLatestAPYStats($cTokenMarket: String!) {
		apyStats(where: { cTokenMarket: $cTokenMarket }, orderBy: "timestamp", orderDirection: "desc", first: 1) {
			id
			timestamp
			cTokenMarket
			interval
			supplyAPY_last
			borrowAPY_last
			utilizationRate_last
			totalSupply_last
			totalBorrows_last
			exchangeRate_last
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
export function useGetLatestApyStatsQuery(
	baseOptions: ApolloReactHooks.QueryHookOptions<GetLatestApyStatsQuery, GetLatestApyStatsQueryVariables> &
		({ variables: GetLatestApyStatsQueryVariables; skip?: boolean } | { skip: boolean }),
) {
	const options = { ...defaultOptions, ...baseOptions };
	return ApolloReactHooks.useQuery<GetLatestApyStatsQuery, GetLatestApyStatsQueryVariables>(
		GetLatestApyStatsDocument,
		options,
	);
}
export function useGetLatestApyStatsLazyQuery(
	baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetLatestApyStatsQuery, GetLatestApyStatsQueryVariables>,
) {
	const options = { ...defaultOptions, ...baseOptions };
	return ApolloReactHooks.useLazyQuery<GetLatestApyStatsQuery, GetLatestApyStatsQueryVariables>(
		GetLatestApyStatsDocument,
		options,
	);
}
export function useGetLatestApyStatsSuspenseQuery(
	baseOptions?:
		| ApolloReactHooks.SkipToken
		| ApolloReactHooks.SuspenseQueryHookOptions<GetLatestApyStatsQuery, GetLatestApyStatsQueryVariables>,
) {
	const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
	return ApolloReactHooks.useSuspenseQuery<GetLatestApyStatsQuery, GetLatestApyStatsQueryVariables>(
		GetLatestApyStatsDocument,
		options,
	);
}
export type GetLatestApyStatsQueryHookResult = ReturnType<typeof useGetLatestApyStatsQuery>;
export type GetLatestApyStatsLazyQueryHookResult = ReturnType<typeof useGetLatestApyStatsLazyQuery>;
export type GetLatestApyStatsSuspenseQueryHookResult = ReturnType<typeof useGetLatestApyStatsSuspenseQuery>;
export type GetLatestApyStatsQueryResult = ApolloReactCommon.QueryResult<
	GetLatestApyStatsQuery,
	GetLatestApyStatsQueryVariables
>;
export const GetCTokenApyDataDocument = gql`
	query GetCTokenAPYData($cTokenMarket: String!, $from: Timestamp!, $to: Timestamp!, $first: Int = 1000) {
		cTokenAPYData(
			where: { cTokenMarket: $cTokenMarket, timestamp_gte: $from, timestamp_lte: $to }
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
export function useGetCTokenApyDataQuery(
	baseOptions: ApolloReactHooks.QueryHookOptions<GetCTokenApyDataQuery, GetCTokenApyDataQueryVariables> &
		({ variables: GetCTokenApyDataQueryVariables; skip?: boolean } | { skip: boolean }),
) {
	const options = { ...defaultOptions, ...baseOptions };
	return ApolloReactHooks.useQuery<GetCTokenApyDataQuery, GetCTokenApyDataQueryVariables>(
		GetCTokenApyDataDocument,
		options,
	);
}
export function useGetCTokenApyDataLazyQuery(
	baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetCTokenApyDataQuery, GetCTokenApyDataQueryVariables>,
) {
	const options = { ...defaultOptions, ...baseOptions };
	return ApolloReactHooks.useLazyQuery<GetCTokenApyDataQuery, GetCTokenApyDataQueryVariables>(
		GetCTokenApyDataDocument,
		options,
	);
}
export function useGetCTokenApyDataSuspenseQuery(
	baseOptions?:
		| ApolloReactHooks.SkipToken
		| ApolloReactHooks.SuspenseQueryHookOptions<GetCTokenApyDataQuery, GetCTokenApyDataQueryVariables>,
) {
	const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
	return ApolloReactHooks.useSuspenseQuery<GetCTokenApyDataQuery, GetCTokenApyDataQueryVariables>(
		GetCTokenApyDataDocument,
		options,
	);
}
export type GetCTokenApyDataQueryHookResult = ReturnType<typeof useGetCTokenApyDataQuery>;
export type GetCTokenApyDataLazyQueryHookResult = ReturnType<typeof useGetCTokenApyDataLazyQuery>;
export type GetCTokenApyDataSuspenseQueryHookResult = ReturnType<typeof useGetCTokenApyDataSuspenseQuery>;
export type GetCTokenApyDataQueryResult = ApolloReactCommon.QueryResult<
	GetCTokenApyDataQuery,
	GetCTokenApyDataQueryVariables
>;
export const GetMarketOverviewDocument = gql`
	query GetMarketOverview($cTokenMarket: ID!) {
		cTokenMarket(id: $cTokenMarket) {
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
export function useGetMarketOverviewQuery(
	baseOptions: ApolloReactHooks.QueryHookOptions<GetMarketOverviewQuery, GetMarketOverviewQueryVariables> &
		({ variables: GetMarketOverviewQueryVariables; skip?: boolean } | { skip: boolean }),
) {
	const options = { ...defaultOptions, ...baseOptions };
	return ApolloReactHooks.useQuery<GetMarketOverviewQuery, GetMarketOverviewQueryVariables>(
		GetMarketOverviewDocument,
		options,
	);
}
export function useGetMarketOverviewLazyQuery(
	baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetMarketOverviewQuery, GetMarketOverviewQueryVariables>,
) {
	const options = { ...defaultOptions, ...baseOptions };
	return ApolloReactHooks.useLazyQuery<GetMarketOverviewQuery, GetMarketOverviewQueryVariables>(
		GetMarketOverviewDocument,
		options,
	);
}
export function useGetMarketOverviewSuspenseQuery(
	baseOptions?:
		| ApolloReactHooks.SkipToken
		| ApolloReactHooks.SuspenseQueryHookOptions<GetMarketOverviewQuery, GetMarketOverviewQueryVariables>,
) {
	const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
	return ApolloReactHooks.useSuspenseQuery<GetMarketOverviewQuery, GetMarketOverviewQueryVariables>(
		GetMarketOverviewDocument,
		options,
	);
}
export type GetMarketOverviewQueryHookResult = ReturnType<typeof useGetMarketOverviewQuery>;
export type GetMarketOverviewLazyQueryHookResult = ReturnType<typeof useGetMarketOverviewLazyQuery>;
export type GetMarketOverviewSuspenseQueryHookResult = ReturnType<typeof useGetMarketOverviewSuspenseQuery>;
export type GetMarketOverviewQueryResult = ApolloReactCommon.QueryResult<
	GetMarketOverviewQuery,
	GetMarketOverviewQueryVariables
>;
