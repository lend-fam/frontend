import { useMemo } from 'react';
import { useAccount, useChainId, useReadContracts } from 'wagmi';
import type { Address } from 'viem';
import { 
	COLLECTIONS_VAULT_ABI, 
	ERC20_ABI,
	getCollectionsVaultAddress 
} from '../contracts';
import { MARKET_QUERY_CONFIG } from './market-query.constants';

// Type definitions for user-specific collection data
export interface UserCollectionBalance {
	collectionId: bigint;
	vaultShares: bigint;
	vaultAssets: bigint;
}

export interface NFTOwnershipInfo {
	collectionAddress: Address;
	balance: bigint;
	hasNFTs: boolean;
}

// Hook to get user's vault balances for multiple collections
export const useUserCollectionVaultBalances = (collectionIds: bigint[]) => {
	const { address: userAddress } = useAccount();
	const chainId = useChainId();
	const vaultAddress = getCollectionsVaultAddress(chainId);

	// Create contracts array for batch balance checking
	const contracts = useMemo(() => {
		if (!userAddress || !collectionIds.length) return [];

		return collectionIds.map((collectionId) => ({
			address: vaultAddress,
			abi: COLLECTIONS_VAULT_ABI,
			functionName: 'balanceOf' as const,
			args: [userAddress, collectionId] as const,
		}));
	}, [userAddress, collectionIds, vaultAddress]);

	const { data, ...query } = useReadContracts({
		contracts,
		query: {
			...MARKET_QUERY_CONFIG.COLLECTION_VAULT_BALANCES,
			enabled: 
				vaultAddress !== '0x0000000000000000000000000000000000000000' &&
				!!userAddress &&
				collectionIds.length > 0,
		},
	});

	const userBalances = useMemo(() => {
		if (!data || !collectionIds.length) return [];

		return collectionIds.map((collectionId, index) => {
			const result = data[index];
			return {
				collectionId,
				vaultShares: result.status === 'success' ? result.result as bigint : 0n,
				vaultAssets: 0n, // We'll need to convert shares to assets separately
			};
		});
	}, [data, collectionIds]);

	return {
		userBalances,
		...query,
	};
};

// Hook to convert vault shares to assets for multiple collections
export const useConvertSharesToAssets = (sharesToConvert: Array<{ collectionId: bigint; shares: bigint }>) => {
	const chainId = useChainId();
	const vaultAddress = getCollectionsVaultAddress(chainId);

	// Create contracts array for batch conversion
	const contracts = useMemo(() => {
		return sharesToConvert.map(({ collectionId, shares }) => ({
			address: vaultAddress,
			abi: COLLECTIONS_VAULT_ABI,
			functionName: 'convertToAssets' as const,
			args: [collectionId, shares] as const,
		}));
	}, [sharesToConvert, vaultAddress]);

	const { data, ...query } = useReadContracts({
		contracts,
		query: {
			...MARKET_QUERY_CONFIG.COLLECTION_VAULT_BALANCES,
			enabled: 
				vaultAddress !== '0x0000000000000000000000000000000000000000' &&
				sharesToConvert.length > 0 &&
				sharesToConvert.every(({ shares }) => shares > 0n),
		},
	});

	const convertedAssets = useMemo(() => {
		if (!data || !sharesToConvert.length) return [];

		return sharesToConvert.map(({ collectionId, shares }, index) => {
			const result = data[index];
			return {
				collectionId,
				shares,
				assets: result.status === 'success' ? result.result as bigint : 0n,
			};
		});
	}, [data, sharesToConvert]);

	return {
		convertedAssets,
		...query,
	};
};

// Hook to get user's complete vault balances with asset conversion
export const useUserCollectionVaultBalancesWithAssets = (collectionIds: bigint[]) => {
	const { userBalances, ...balanceQuery } = useUserCollectionVaultBalances(collectionIds);
	
	const sharesToConvert = useMemo(() => {
		return userBalances
			.filter(balance => balance.vaultShares > 0n)
			.map(balance => ({
				collectionId: balance.collectionId,
				shares: balance.vaultShares,
			}));
	}, [userBalances]);

	const { convertedAssets, ...conversionQuery } = useConvertSharesToAssets(sharesToConvert);

	const userBalancesWithAssets = useMemo(() => {
		return userBalances.map(balance => {
			const conversion = convertedAssets.find(
				c => c.collectionId === balance.collectionId
			);
			return {
				...balance,
				vaultAssets: conversion?.assets || 0n,
			};
		});
	}, [userBalances, convertedAssets]);

	return {
		userBalances: userBalancesWithAssets,
		loading: balanceQuery.isPending || conversionQuery.isPending,
		error: balanceQuery.error || conversionQuery.error,
		refetch: () => {
			balanceQuery.refetch();
			conversionQuery.refetch();
		},
	};
};

// Hook to check NFT ownership for multiple collections
export const useNFTOwnership = (collectionAddresses: Address[]) => {
	const { address: userAddress } = useAccount();

	// Create contracts array for batch NFT balance checking
	const contracts = useMemo(() => {
		if (!userAddress || !collectionAddresses.length) return [];

		return collectionAddresses.map((collectionAddress) => ({
			address: collectionAddress,
			abi: ERC20_ABI, // Using ERC20 ABI for balanceOf, works for ERC721/ERC1155 too
			functionName: 'balanceOf' as const,
			args: [userAddress] as const,
		}));
	}, [userAddress, collectionAddresses]);

	const { data, ...query } = useReadContracts({
		contracts,
		query: {
			...MARKET_QUERY_CONFIG.NFT_OWNERSHIP,
			enabled: !!userAddress && collectionAddresses.length > 0,
		},
	});

	const ownershipInfo = useMemo(() => {
		if (!data || !collectionAddresses.length) return [];

		return collectionAddresses.map((collectionAddress, index) => {
			const result = data[index];
			const balance = result.status === 'success' ? result.result as bigint : 0n;
			return {
				collectionAddress,
				balance,
				hasNFTs: balance > 0n,
			};
		});
	}, [data, collectionAddresses]);

	return {
		ownershipInfo,
		...query,
	};
};

// Hook to check if user is collection operator for multiple collections
export const useIsCollectionOperator = (collectionIds: bigint[]) => {
	const { address: userAddress } = useAccount();
	const chainId = useChainId();
	const vaultAddress = getCollectionsVaultAddress(chainId);

	// Create contracts array for batch operator checking
	const contracts = useMemo(() => {
		if (!userAddress || !collectionIds.length) return [];

		return collectionIds.map((collectionId) => ({
			address: vaultAddress,
			abi: COLLECTIONS_VAULT_ABI,
			functionName: 'isCollectionOperator' as const,
			args: [collectionId, userAddress] as const,
		}));
	}, [userAddress, collectionIds, vaultAddress]);

	const { data, ...query } = useReadContracts({
		contracts,
		query: {
			...MARKET_QUERY_CONFIG.COLLECTION_REGISTRY,
			enabled: 
				vaultAddress !== '0x0000000000000000000000000000000000000000' &&
				!!userAddress &&
				collectionIds.length > 0,
		},
	});

	const operatorStatus = useMemo(() => {
		if (!data || !collectionIds.length) return [];

		return collectionIds.map((collectionId, index) => {
			const result = data[index];
			return {
				collectionId,
				isOperator: result.status === 'success' ? result.result as boolean : false,
			};
		});
	}, [data, collectionIds]);

	return {
		operatorStatus,
		...query,
	};
};

// Master hook that combines all user-specific collection data
export const useUserCollectionsData = (
	collectionIds: bigint[],
	collectionAddresses: Address[]
) => {
	const { userBalances, ...balanceQuery } = useUserCollectionVaultBalancesWithAssets(collectionIds);
	const { ownershipInfo, ...ownershipQuery } = useNFTOwnership(collectionAddresses);
	const { operatorStatus, ...operatorQuery } = useIsCollectionOperator(collectionIds);

	const combinedData = useMemo(() => {
		return collectionIds.map(collectionId => {
			const balance = userBalances.find(b => b.collectionId === collectionId);
			const operator = operatorStatus.find(o => o.collectionId === collectionId);
			
			// Find corresponding collection address by index (assuming same order)
			const collectionIndex = collectionIds.findIndex(id => id === collectionId);
			const ownership = collectionAddresses[collectionIndex] ? 
				ownershipInfo.find(o => o.collectionAddress === collectionAddresses[collectionIndex]) : 
				null;

			return {
				collectionId,
				vaultBalance: {
					shares: balance?.vaultShares || 0n,
					assets: balance?.vaultAssets || 0n,
				},
				nftOwnership: {
					hasNFTs: ownership?.hasNFTs || false,
					balance: ownership?.balance || 0n,
				},
				isOperator: operator?.isOperator || false,
			};
		});
	}, [collectionIds, collectionAddresses, userBalances, ownershipInfo, operatorStatus]);

	return {
		userCollectionsData: combinedData,
		loading: balanceQuery.loading || ownershipQuery.isPending || operatorQuery.isPending,
		error: balanceQuery.error || ownershipQuery.error || operatorQuery.error,
		refetch: () => {
			balanceQuery.refetch();
			ownershipQuery.refetch();
			operatorQuery.refetch();
		},
	};
};

// Helper functions for data transformation
export const calculateNFTMultiplier = (nftBalance: bigint, collectionType: 'ERC721' | 'ERC1155'): number | null => {
	if (nftBalance === 0n) return null;
	
	// This is a placeholder calculation - the actual multiplier logic 
	// would depend on the specific collection's weight function
	if (collectionType === 'ERC721') {
		// For ERC721, each NFT might have equal weight
		return Number(nftBalance);
	} else {
		// For ERC1155, the balance represents the quantity of fungible tokens
		// The multiplier might be based on a different calculation
		return Math.min(Number(nftBalance), 10); // Cap at 10x multiplier
	}
};

export const getUserOwnershipStatus = (hasNFTs: boolean): 'owned' | 'not_owned' | 'unknown' => {
	return hasNFTs ? 'owned' : 'not_owned';
};