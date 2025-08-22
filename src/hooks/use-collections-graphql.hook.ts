import { useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import type { Collection } from '../graphql/generated';

// GraphQL query for all active collections
const GET_ALL_COLLECTIONS_QUERY = gql`
	query GetAllCollections {
		collectionRegistries {
			id
			totalCollections
			totalActiveCollections
			collections {
				id
				contractAddress
				name
				symbol
				totalSupply
				collectionType
				isActive
				yieldSharePercentage
				weightFunctionType
				weightFunctionP1
				weightFunctionP2
				createdAtBlock
				createdAtTimestamp
				updatedAtBlock
				updatedAtTimestamp
			}
		}
	}
`;

// GraphQL query for specific collections by IDs
const GET_COLLECTIONS_BY_IDS_QUERY = gql`
	query GetCollectionsByIds($ids: [ID!]!) {
		collections(where: { id_in: $ids }) {
			id
			contractAddress
			name
			symbol
			totalSupply
			collectionType
			isActive
			yieldSharePercentage
			weightFunctionType
			weightFunctionP1
			weightFunctionP2
			createdAtBlock
			createdAtTimestamp
			updatedAtBlock
			updatedAtTimestamp
		}
	}
`;

// Hook for fetching all collections
export const useAllCollectionsGraphQL = () => {
	const { data, loading, error, refetch } = useQuery(GET_ALL_COLLECTIONS_QUERY, {
		fetchPolicy: 'cache-first',
		errorPolicy: 'all',
	});

	const collections = useMemo(() => {
		if (!data?.collectionRegistries?.[0]?.collections) {
			return [];
		}
		return data.collectionRegistries[0].collections.filter((collection: Collection) => collection.isActive);
	}, [data]);

	const registry = useMemo(() => {
		return data?.collectionRegistries?.[0] || null;
	}, [data]);

	return {
		collections,
		registry,
		loading,
		error,
		refetch,
	};
};

// Hook for fetching specific collections by their IDs
export const useCollectionsByIds = (collectionIds: string[]) => {
	const { data, loading, error, refetch } = useQuery(GET_COLLECTIONS_BY_IDS_QUERY, {
		variables: { ids: collectionIds },
		fetchPolicy: 'cache-first',
		errorPolicy: 'all',
		skip: collectionIds.length === 0,
	});

	const collections = useMemo(() => {
		return data?.collections || [];
	}, [data]);

	return {
		collections,
		loading,
		error,
		refetch,
	};
};

// Hook for fetching a specific collection by ID
export const useCollectionById = (collectionId: string) => {
	const { collections, loading, error, refetch } = useCollectionsByIds([collectionId]);

	const collection = useMemo(() => {
		return collections.find((c: Collection) => c.id === collectionId) || null;
	}, [collections, collectionId]);

	return {
		collection,
		loading,
		error,
		refetch,
	};
};

// Type definitions for the frontend components
export type CollectionData = {
	id: string;
	contractAddress: string;
	name: string;
	symbol: string;
	totalSupply: string;
	collectionType: 'ERC721' | 'ERC1155';
	isActive: boolean;
	yieldSharePercentage: number;
	weightFunction: {
		type: 'LINEAR' | 'EXPONENTIAL';
		p1: string;
		p2: string;
	};
	createdAtBlock: string;
	createdAtTimestamp: string;
	updatedAtBlock: string;
	updatedAtTimestamp: string;
};

// Helper function to transform GraphQL collection data to frontend format
export const transformCollectionData = (collection: Collection): CollectionData => {
	return {
		id: collection.id,
		contractAddress: collection.contractAddress,
		name: collection.name,
		symbol: collection.symbol,
		totalSupply: collection.totalSupply.toString(),
		collectionType: collection.collectionType as 'ERC721' | 'ERC1155',
		isActive: collection.isActive,
		yieldSharePercentage: Number(collection.yieldSharePercentage) / 100,
		weightFunction: {
			type: collection.weightFunctionType as 'LINEAR' | 'EXPONENTIAL',
			p1: collection.weightFunctionP1.toString(),
			p2: collection.weightFunctionP2.toString(),
		},
		createdAtBlock: collection.createdAtBlock.toString(),
		createdAtTimestamp: collection.createdAtTimestamp.toString(),
		updatedAtBlock: collection.updatedAtBlock.toString(),
		updatedAtTimestamp: collection.updatedAtTimestamp.toString(),
	};
};

// Hook that returns transformed collection data
export const useCollectionsTransformed = () => {
	const { collections, registry, loading, error, refetch } = useAllCollectionsGraphQL();

	const transformedCollections = useMemo(() => {
		return collections.map(transformCollectionData);
	}, [collections]);

	return {
		collections: transformedCollections,
		registry,
		loading,
		error,
		refetch,
	};
};
