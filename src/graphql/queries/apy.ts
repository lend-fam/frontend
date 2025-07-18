import { gql } from '@apollo/client';

export const GET_HISTORICAL_APY = gql`
	query GetHistoricalAPY($cTokenMarket: String!, $from: Int!, $to: Int!, $interval: String!) {
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

export const GET_LATEST_APY_STATS = gql`
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

export const GET_CTOKEN_APY_DATA = gql`
	query GetCTokenAPYData($cTokenMarket: String!, $from: Int!, $to: Int!, $first: Int = 1000) {
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

export const GET_MARKET_OVERVIEW = gql`
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
