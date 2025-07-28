import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// Enhanced HTTP link with connection pooling
const httpLink = new HttpLink({
	uri: import.meta.env.VITE_GRAPHQL_ENDPOINT,
	// Enable connection reuse
	fetchOptions: {
		keepalive: true,
	},
});

// Error handling link for better debugging
const errorLink = onError(({ graphQLErrors, networkError }) => {
	if (graphQLErrors) {
		graphQLErrors.forEach(({ message, locations, path }) => {
			console.warn(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`);
		});
	}

	if (networkError) {
		console.warn(`Network error: ${networkError}`);
	}
});

// Enhanced cache configuration for better performance
const cache = new InMemoryCache({
	typePolicies: {
		Query: {
			fields: {
				// Cache historical data more aggressively
				historicalAPYData: {
					merge: false, // Don't merge arrays, replace them
				},
				marketEvents: {
					merge: false, // Don't merge arrays, replace them
				},
			},
		},
	},
	// Improve garbage collection
	resultCaching: true,
	canonizeResults: true,
});

export const apolloClient = new ApolloClient({
	link: from([errorLink, httpLink]),
	cache,
	defaultOptions: {
		watchQuery: {
			errorPolicy: 'all',
			// Enhanced caching options
			fetchPolicy: 'cache-first',
			notifyOnNetworkStatusChange: false,
		},
		query: {
			errorPolicy: 'all',
			// Use cache-first for better performance
			fetchPolicy: 'cache-first',
		},
	},
	// Connection optimization
	connectToDevTools: import.meta.env.DEV,
});
