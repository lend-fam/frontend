import { gql } from '@apollo/client';

export const GET_SIMPLE_APY_STATS = gql`
	query GetSimpleAPYStats($cTokenMarket: String!) {
		ctokenAPYDatas(
			where: { cTokenMarket: $cTokenMarket }
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

export const GET_ALL_APY_STATS = gql`
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

export const GET_CTOKEN_MARKETS = gql`
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
