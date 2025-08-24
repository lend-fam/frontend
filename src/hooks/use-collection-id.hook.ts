import { useMemo } from 'react';
import { useReadContract, useChainId } from 'wagmi';
import type { Address } from 'viem';
import { COLLECTION_REGISTRY_ABI, getCollectionRegistryAddress } from '../contracts';

/**
 * Hook to get collection ID from collection address
 * Uses the CollectionRegistry.getCollectionId function to get the actual registered collection ID
 */
export const useCollectionId = (collectionAddress: Address | undefined): bigint | undefined => {
	const chainId = useChainId();
	const registryAddress = getCollectionRegistryAddress(chainId);

	const { data: collectionId } = useReadContract({
		address: registryAddress,
		abi: COLLECTION_REGISTRY_ABI,
		functionName: 'getCollectionId',
		args: collectionAddress ? [collectionAddress, BigInt(chainId)] : undefined,
		query: {
			enabled: !!collectionAddress && registryAddress !== '0x0000000000000000000000000000000000000000',
		},
	});

	return useMemo(() => {
		if (!collectionId || collectionId === 0n) {
			return undefined;
		}
		return collectionId;
	}, [collectionId]);
};
