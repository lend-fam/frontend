import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const TEST_SUBGRAPH_QUERY = gql`
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

export const useSubgraphTest = () => {
	const { data, loading, error } = useQuery(TEST_SUBGRAPH_QUERY, {
		errorPolicy: 'all',
	});

	// Debug hook - console logs removed for production

	return { data, loading, error };
};
