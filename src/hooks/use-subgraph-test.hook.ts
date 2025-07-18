import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const TEST_SUBGRAPH_QUERY = gql`
	query TestSubgraph {
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

export const useSubgraphTest = () => {
	const { data, loading, error } = useQuery(TEST_SUBGRAPH_QUERY, {
		errorPolicy: 'all',
	});

	if (error) {
		console.log('Subgraph Test Result:', {
			loading,
			error: error?.message,
			networkError: error?.networkError,
			graphQLErrors: error?.graphQLErrors,
		});
	}

	return { data, loading, error };
};
