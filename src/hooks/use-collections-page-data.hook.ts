import { useMemo } from 'react';
import type { Address } from 'viem';
import { useReadContracts, useChainId } from 'wagmi';
import {
	useCollectionsTransformed,
	type CollectionData as GraphQLCollectionData,
} from './use-collections-graphql.hook';
import { useAllActiveCollectionsWithDetails } from './use-collections-registry.hook';
import {
	useUserCollectionsData,
	calculateNFTMultiplier,
	getUserOwnershipStatus,
} from './use-user-collections-data.hook';
import { VAULT_REGISTRY_ABI, getVaultRegistryAddress, COLLECTIONS_VAULT_ABI } from '../contracts';

// Type definition matching the existing CollectionsPage component expectations
export type CollectionData = {
	collectionAddress: Address;
	collectionName: string;
	collectionType: 'ERC721' | 'ERC1155';
	yieldSharePercentage: number;
	userOwnership?: 'owned' | 'not_owned' | 'unknown';
	nftMultiplier?: number | null;
	weightFunction?: {
		type: 'LINEAR' | 'EXPONENTIAL';
		key: string;
		label: string;
		description?: string;
	};
	vaultCount: number;
	totalVaults: string;
	status: 'Active' | 'Inactive';
	actions: string;
};

// Hook to get all supported vault addresses from Vault Registry
const useAllSupportedVaults = () => {
	const chainId = useChainId();
	const contractAddress = getVaultRegistryAddress(chainId);

	return useReadContracts({
		contracts: [
			{
				address: contractAddress,
				abi: VAULT_REGISTRY_ABI,
				functionName: 'getAllSupportedVaults',
			} as const,
		],
		query: {
			enabled: contractAddress !== '0x0000000000000000000000000000000000000000',
			staleTime: 60000, // 60 seconds - vault addresses change infrequently
		},
	});
};

// Hook to get vault counts for collections across all supported vaults
const useCollectionMultiVaultCounts = (collectionIds: bigint[], vaultAddresses: Address[]) => {
	return useReadContracts({
		contracts: collectionIds.flatMap((collectionId) =>
			vaultAddresses.map(
				(vaultAddress) =>
					({
						address: vaultAddress,
						abi: COLLECTIONS_VAULT_ABI,
						functionName: 'totalAssets',
						args: [collectionId],
					}) as const,
			),
		),
		query: {
			enabled: collectionIds.length > 0 && vaultAddresses.length > 0,
			staleTime: 30000, // 30 seconds - deposit amounts change more frequently
		},
	});
};

// Master hook that combines all data sources for the collections page
export const useCollectionsPageData = () => {
	// Fetch GraphQL data (static collection metadata)
	const {
		collections: graphqlCollections,
		loading: graphqlLoading,
		error: graphqlError,
		refetch: graphqlRefetch,
	} = useCollectionsTransformed();

	// Fetch on-chain registry data (active collections with details)
	const {
		collectionsWithDetails: registryCollections,
		loading: registryLoading,
		error: registryError,
		refetch: registryRefetch,
	} = useAllActiveCollectionsWithDetails();

	// Prepare data for user-specific queries
	const collectionIds = useMemo(() => {
		return registryCollections?.map((c) => c.id) || [];
	}, [registryCollections]);

	const collectionAddresses = useMemo(() => {
		return registryCollections?.map((c) => c.details.originalAddress) || [];
	}, [registryCollections]);

	// Fetch all supported vault addresses from Vault Registry
	const { data: vaultAddressesData, error: vaultAddressesError } = useAllSupportedVaults();

	// Extract vault addresses from the result
	const vaultAddresses = useMemo(() => {
		const addresses = vaultAddressesData?.[0]?.result || [];
		return [...addresses] as Address[]; // Convert readonly to mutable array
	}, [vaultAddressesData]);

	// Fetch vault counts for all collections across all vaults
	const { data: multiVaultData, error: multiVaultError } = useCollectionMultiVaultCounts(
		collectionIds,
		vaultAddresses,
	);

	// Fetch user-specific data (balances, ownership, etc.)
	const {
		userCollectionsData,
		loading: userDataLoading,
		error: userDataError,
		refetch: userDataRefetch,
	} = useUserCollectionsData(collectionIds, collectionAddresses);

	// Combine and transform all data sources
	const collectionsData = useMemo(() => {
		if (!registryCollections) {
			return [];
		}

		return registryCollections.map((registryCollection, collectionIndex) => {
			const { id, details } = registryCollection;

			// Find corresponding GraphQL data by contract address
			const graphqlData = graphqlCollections?.find(
				(gc: GraphQLCollectionData) =>
					gc.contractAddress.toLowerCase() === details.originalAddress.toLowerCase(),
			);

			// Find corresponding user data
			const userData = userCollectionsData.find((ud) => ud.collectionId === id);

			// Transform collection type
			const collectionType = details.collectionType === 0 ? 'ERC721' : 'ERC1155';

			// Transform weight function
			const weightFunctionType = details.weightFunction.fnType === 0 ? 'LINEAR' : 'EXPONENTIAL';
			const weightFunction = {
				type: weightFunctionType as 'LINEAR' | 'EXPONENTIAL',
				key: weightFunctionType.toLowerCase(),
				label: weightFunctionType === 'LINEAR' ? 'Linear' : 'Exponential',
				description:
					weightFunctionType === 'LINEAR' ? 'Linear weight distribution' : 'Exponential weight distribution',
			};

			// Calculate NFT multiplier
			const nftMultiplier = userData
				? calculateNFTMultiplier(userData.nftOwnership.balance, collectionType)
				: null;

			// Determine user ownership status
			const userOwnership = userData ? getUserOwnershipStatus(userData.nftOwnership.hasNFTs) : 'unknown';

			// Count vaults with deposits for this collection
			const getVaultCountForCollection = (
				collectionIndex: number,
				vaultResults: unknown[],
				numVaults: number,
			): number => {
				let vaultCount = 0;
				for (let vaultIndex = 0; vaultIndex < numVaults; vaultIndex++) {
					const resultIndex = collectionIndex * numVaults + vaultIndex;
					const result = vaultResults[resultIndex] as { result?: bigint; status?: string };
					if (result?.result && result.result > 0n) {
						vaultCount++;
					}
				}
				return vaultCount;
			};

			const vaultCount =
				multiVaultData && vaultAddresses.length > 0
					? getVaultCountForCollection(collectionIndex, multiVaultData, vaultAddresses.length)
					: 0;

			const collectionData: CollectionData = {
				collectionAddress: details.originalAddress,
				collectionName: graphqlData?.name || `Collection ${id}`,
				collectionType,
				yieldSharePercentage: details.yieldSharePercentage,
				userOwnership,
				nftMultiplier,
				weightFunction,
				vaultCount,
				totalVaults: `${vaultCount} vault${vaultCount === 1 ? '' : 's'}`,
				status: details.isActive && !details.isRemoved ? 'Active' : 'Inactive',
				actions: 'actions', // Placeholder for actions column
			};

			return collectionData;
		});
	}, [registryCollections, graphqlCollections, userCollectionsData, multiVaultData, vaultAddresses]);

	// Combined loading state - prioritize registry data, make everything else optional
	// Show collections immediately when registry data is loaded
	// NOTE: Both graphqlLoading and userDataLoading are intentionally excluded to prevent blocking
	const isLoading = registryLoading;

	// Combined error state - only fail if registry fails (GraphQL and vault counts are optional)
	// Log vault errors but don't block the UI since vault counts are supplementary
	const error = registryError || userDataError;

	if (vaultAddressesError) {
		console.warn('Failed to fetch vault addresses:', vaultAddressesError);
	}
	if (multiVaultError) {
		console.warn('Failed to fetch multi-vault data:', multiVaultError);
	}

	// Combined refetch function
	const refetch = () => {
		graphqlRefetch();
		registryRefetch();
		userDataRefetch();
	};

	// Additional computed properties
	const isEmpty = collectionsData.length === 0;
	const hasActiveCollections = collectionsData.some((c) => c.status === 'Active');

	return {
		collections: collectionsData,
		loading: isLoading,
		error,
		isEmpty,
		hasActiveCollections,
		refetch,

		// Expose individual loading states for granular control if needed
		loadingStates: {
			graphql: graphqlLoading,
			registry: registryLoading,
			userData: userDataLoading,
		},

		// Expose individual errors for specific error handling if needed
		errors: {
			graphql: graphqlError,
			registry: registryError,
			userData: userDataError,
		},
	};
};

// Hook with error recovery and fallback handling
export const useCollectionsPageDataWithFallback = () => {
	const mainResult = useCollectionsPageData();

	// If main data fails, we can provide fallback data or alternative approaches
	const fallbackCollections = useMemo(() => {
		if (mainResult.error && !mainResult.loading) {
			// Could implement fallback strategies here:
			// - Use cached GraphQL data only
			// - Use registry data without user data
			// - Show minimal collection info
			return [];
		}
		return mainResult.collections;
	}, [mainResult]);

	return {
		...mainResult,
		collections: fallbackCollections,
		hasFallback: mainResult.error && !mainResult.loading && fallbackCollections.length > 0,
	};
};

// Hook optimized for frequent updates (e.g., when user is actively trading NFTs)
export const useCollectionsPageDataOptimized = () => {
	const result = useCollectionsPageData();

	// Memoize collections data to prevent unnecessary re-renders
	const memoizedCollections = useMemo(() => {
		return result.collections;
	}, [result.collections]);

	return {
		...result,
		collections: memoizedCollections,
	};
};
