import { useMemo } from 'react';
import { useChainId, useReadContracts } from 'wagmi';
import type { Address } from 'viem';
import { COLLECTION_REGISTRY_ABI, getCollectionRegistryAddress } from '../contracts';
import { MARKET_QUERY_CONFIG } from './market-query.constants';

// Type definitions based on the smart contract structs
export interface CollectionSummary {
	collectionId: bigint;
	originalAddress: Address;
	yieldSharePercentage: number;
	isActive: boolean;
}

export interface CollectionDetails {
	collectionId: bigint;
	originalAddress: Address;
	sourceChainId: bigint;
	collectionType: number; // 0 = ERC721, 1 = ERC1155
	weightFunction: {
		fnType: number; // 0 = LINEAR, 1 = EXPONENTIAL
		p1: bigint;
		p2: bigint;
	};
	yieldSharePercentage: number;
	registeredAt: bigint;
	isActive: boolean;
	isRemoved: boolean;
}

export interface CollectionAuthInfo {
	details: CollectionDetails;
	authorizedAddresses: Address[];
	isUserAuthorized: boolean;
}

// Hook to get all active collections from the registry
export const useAllActiveCollections = () => {
	const chainId = useChainId();
	const contractAddress = getCollectionRegistryAddress(chainId);

	return useReadContracts({
		contracts: [
			{
				address: contractAddress,
				abi: COLLECTION_REGISTRY_ABI,
				functionName: 'getAllActiveCollections',
			} as const,
		],
		query: {
			...MARKET_QUERY_CONFIG.COLLECTION_REGISTRY,
			enabled: contractAddress !== '0x0000000000000000000000000000000000000000',
		},
	});
};

// Hook to get active collection count
export const useActiveCollectionCount = () => {
	const chainId = useChainId();
	const contractAddress = getCollectionRegistryAddress(chainId);

	return useReadContracts({
		contracts: [
			{
				address: contractAddress,
				abi: COLLECTION_REGISTRY_ABI,
				functionName: 'getActiveCollectionCount',
			} as const,
		],
		query: {
			...MARKET_QUERY_CONFIG.COLLECTION_METADATA,
			enabled: contractAddress !== '0x0000000000000000000000000000000000000000',
		},
	});
};

// Hook to get collection details by ID
export const useCollectionDetails = (collectionId: bigint) => {
	const chainId = useChainId();
	const contractAddress = getCollectionRegistryAddress(chainId);

	return useReadContracts({
		contracts: [
			{
				address: contractAddress,
				abi: COLLECTION_REGISTRY_ABI,
				functionName: 'getCollectionDetails',
				args: [collectionId],
			} as const,
		],
		query: {
			...MARKET_QUERY_CONFIG.COLLECTION_METADATA,
			enabled: contractAddress !== '0x0000000000000000000000000000000000000000' && collectionId > 0n,
		},
	});
};

// Hook to get collection authorization info for a specific user
export const useCollectionAuthInfo = (collectionId: bigint, userAddress?: Address) => {
	const chainId = useChainId();
	const contractAddress = getCollectionRegistryAddress(chainId);

	return useReadContracts({
		contracts: [
			{
				address: contractAddress,
				abi: COLLECTION_REGISTRY_ABI,
				functionName: 'getCollectionAuthInfo',
				args: [collectionId, userAddress!],
			} as const,
		],
		query: {
			...MARKET_QUERY_CONFIG.COLLECTION_REGISTRY,
			enabled:
				contractAddress !== '0x0000000000000000000000000000000000000000' && collectionId > 0n && !!userAddress,
		},
	});
};

// Hook to get multiple collections by IDs (batch operation)
export const useCollectionsByIds = (collectionIds: bigint[]) => {
	const chainId = useChainId();
	const contractAddress = getCollectionRegistryAddress(chainId);

	return useReadContracts({
		contracts: [
			{
				address: contractAddress,
				abi: COLLECTION_REGISTRY_ABI,
				functionName: 'getCollectionsByIds',
				args: [collectionIds],
			} as const,
		],
		query: {
			...MARKET_QUERY_CONFIG.COLLECTION_METADATA,
			enabled: contractAddress !== '0x0000000000000000000000000000000000000000' && collectionIds.length > 0,
		},
	});
};

// Hook to check if multiple collections are authorized for a user (batch operation)
export const useIsAuthorizedBatch = (collectionIds: bigint[], userAddress?: Address) => {
	const chainId = useChainId();
	const contractAddress = getCollectionRegistryAddress(chainId);

	return useReadContracts({
		contracts: [
			{
				address: contractAddress,
				abi: COLLECTION_REGISTRY_ABI,
				functionName: 'isAuthorizedBatch',
				args: [collectionIds, userAddress!],
			} as const,
		],
		query: {
			...MARKET_QUERY_CONFIG.COLLECTION_REGISTRY,
			enabled:
				contractAddress !== '0x0000000000000000000000000000000000000000' &&
				collectionIds.length > 0 &&
				!!userAddress,
		},
	});
};

// Hook to get total yield basis points across all collections
export const useTotalYieldBps = () => {
	const chainId = useChainId();
	const contractAddress = getCollectionRegistryAddress(chainId);

	return useReadContracts({
		contracts: [
			{
				address: contractAddress,
				abi: COLLECTION_REGISTRY_ABI,
				functionName: 'totalYieldBps',
			} as const,
		],
		query: {
			...MARKET_QUERY_CONFIG.COLLECTION_METADATA,
			enabled: contractAddress !== '0x0000000000000000000000000000000000000000',
		},
	});
};

// Hook that combines all active collections with their details (optimized)
export const useAllActiveCollectionsWithDetails = () => {
	const { data: activeCollectionsData, ...activeCollectionsQuery } = useAllActiveCollections();

	const collectionsData = useMemo(() => {
		if (!activeCollectionsData?.[0]?.result) return null;

		// Handle the result from getAllActiveCollections
		const result = activeCollectionsData[0].result;

		// Type guard to check if it's a tuple [collectionIds, summaries]
		const isTupleResult = (r: unknown): r is [readonly bigint[], readonly CollectionSummary[]] => {
			return (
				Array.isArray(r) &&
				r.length === 2 &&
				Array.isArray(r[0]) &&
				Array.isArray(r[1]) &&
				(r[0].length === 0 || typeof r[0][0] === 'bigint')
			);
		};

		// Type guard to check if it's just an array of collection IDs
		const isIdArrayResult = (r: unknown): r is readonly bigint[] => {
			return Array.isArray(r) && (r.length === 0 || typeof r[0] === 'bigint');
		};

		if (isTupleResult(result)) {
			const [collectionIds, summaries] = result;
			return { collectionIds: [...collectionIds], summaries: [...summaries] };
		} else if (isIdArrayResult(result)) {
			return { collectionIds: [...result], summaries: null };
		} else {
			// Fallback: empty arrays
			return { collectionIds: [], summaries: null };
		}
	}, [activeCollectionsData]);

	// Get detailed info for all collections if we have the basic data
	const { data: detailsData, ...detailsQuery } = useCollectionsByIds(collectionsData?.collectionIds || []);

	const collectionsWithDetails = useMemo(() => {
		if (!collectionsData || !detailsData?.[0]?.result) {
			return [];
		}

		const [
			originalAddresses,
			sourceChainIds,
			collectionTypes,
			weightFunctions,
			yieldSharePercentages,
			registeredAts,
		] = detailsData[0].result as [
			Address[],
			bigint[],
			number[],
			Array<{ fnType: number; p1: bigint; p2: bigint }>,
			number[],
			bigint[],
		];

		return collectionsData.collectionIds.map((id, index) => {
			// If we have summaries from getAllActiveCollections, use them; otherwise create a basic summary
			const summary = collectionsData.summaries?.[index] || {
				collectionId: id,
				originalAddress: originalAddresses[index],
				yieldSharePercentage: yieldSharePercentages[index] / 100,
				isActive: true, // Since these are from getAllActiveCollections, they must be active
			};

			return {
				id,
				summary,
				details: {
					collectionId: id,
					originalAddress: originalAddresses[index],
					sourceChainId: sourceChainIds[index],
					collectionType: collectionTypes[index],
					weightFunction: weightFunctions[index],
					yieldSharePercentage: yieldSharePercentages[index] / 100,
					registeredAt: registeredAts[index],
					isActive: true, // Active collections are not removed
					isRemoved: false,
				},
			};
		});
	}, [collectionsData, detailsData]);

	return {
		collectionsWithDetails,
		collectionsData,
		loading: activeCollectionsQuery.isPending || detailsQuery.isPending,
		error: activeCollectionsQuery.error || detailsQuery.error,
		refetch: () => {
			activeCollectionsQuery.refetch();
			if (collectionsData?.collectionIds.length) {
				detailsQuery.refetch();
			}
		},
	};
};

// Helper functions to transform contract data
export const transformCollectionType = (type: number): 'ERC721' | 'ERC1155' => {
	return type === 0 ? 'ERC721' : 'ERC1155';
};

export const transformWeightFunctionType = (type: number): 'LINEAR' | 'EXPONENTIAL' => {
	return type === 0 ? 'LINEAR' : 'EXPONENTIAL';
};

export const formatCollectionData = (details: CollectionDetails) => {
	return {
		id: details.collectionId.toString(),
		collectionAddress: details.originalAddress,
		sourceChainId: details.sourceChainId.toString(),
		collectionType: transformCollectionType(details.collectionType),
		weightFunction: {
			type: transformWeightFunctionType(details.weightFunction.fnType),
			p1: details.weightFunction.p1.toString(),
			p2: details.weightFunction.p2.toString(),
		},
		yieldSharePercentage: details.yieldSharePercentage,
		registeredAt: new Date(Number(details.registeredAt) * 1000),
		isActive: details.isActive,
		isRemoved: details.isRemoved,
	};
};
