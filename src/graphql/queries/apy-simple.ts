import { gql } from '@apollo/client';

export const GET_SIMPLE_APY_STATS = gql`
	query GetSimpleAPYStats($cTokenMarket: String!) {
		apyStats(where: { cTokenMarket: $cTokenMarket }, orderBy: "timestamp", orderDirection: "desc", first: 10) {
			id
			timestamp
			cTokenMarket
			interval
			supplyAPY_last
			borrowAPY_last
			utilizationRate_last
			dataPoints
		}
	}
`;

export const GET_ALL_APY_STATS = gql`
	query GetAllAPYStats {
		apyStats(first: 5) {
			id
			timestamp
			cTokenMarket
			interval
			supplyAPY_last
			borrowAPY_last
			utilizationRate_last
			dataPoints
		}
	}
`;

export const GET_CTOKEN_MARKETS = gql`
	query GetCTokenMarkets {
		cTokenMarkets(first: 5) {
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
