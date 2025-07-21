import { gql } from '@apollo/client';

export const GET_HISTORICAL_APY = gql`
	query GetHistoricalAPY($cTokenMarket: String!, $from: Int!, $to: Int!, $interval: String!) {
		ctokenAPYDatas(
			where: { cTokenMarket: $cTokenMarket, timestamp_gte: $from, timestamp_lte: $to }
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
			transactionHash
			baseRatePerBlock
			multiplierPerBlock
			jumpMultiplierPerBlock
			kink
		}
	}
`;

export const GET_LATEST_APY_STATS = gql`
	query GetLatestAPYStats($cTokenMarket: String!) {
		ctokenAPYDatas(where: { cTokenMarket: $cTokenMarket }, orderBy: "timestamp", orderDirection: "desc", first: 1) {
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
			baseRatePerBlock
			multiplierPerBlock
			jumpMultiplierPerBlock
			kink
		}
	}
`;

export const GET_CTOKEN_APY_DATA = gql`
	query GetCTokenAPYData($cTokenMarket: String!, $from: Int!, $to: Int!, $first: Int = 1000) {
		ctokenAPYDatas(
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
		ctokenMarket(id: $cTokenMarket) {
			id
			symbol
			name
			decimals
			totalSupply
			totalBorrows
			totalReserves
			cash
			exchangeRate
			borrowIndex
			collateralFactor
			reserveFactor
			interestRateModelAddress
			interestRateModelType
			baseRatePerBlock
			multiplierPerBlock
			jumpMultiplierPerBlock
			kink
			gapPerBlock
			potAddress
			jugAddress
			createdAtTimestamp
			updatedAtTimestamp
		}
	}
`;
