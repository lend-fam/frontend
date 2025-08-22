import { useMemo } from 'react';
import type { Address } from 'viem';
import { useReadContracts, useChainId, useAccount } from 'wagmi';
import { CollectionService } from '../services/collection.service';
import { FormattingService } from '../services/formatting.service';
import { useCollectionsPageData } from './use-collections-page-data.hook';
import { useAllActiveCollectionsWithDetails } from './use-collections-registry.hook';
import {
	VAULT_REGISTRY_ABI,
	getVaultRegistryAddress,
	COLLECTIONS_VAULT_ABI,
	DEBT_SUBSIDIZER_ABI,
	getDebtSubsidizerAddress,
	ERC20_ABI,
} from '../contracts';
import type { CollectionDetailData, VaultInfo } from '../ui/collection-detail-page/collection-detail-page.component';

// Type definition for VaultRegistry.VaultInfo struct based on ABI
interface VaultRegistryInfo {
	vault: Address;
	asset: Address;
	cToken: Address;
	lendingManager: Address;
	name: string;
	symbol: string;
	active: boolean;
	registeredAt: bigint;
}

// Hook to get vault names from vault registry
const useVaultNames = (vaultAddresses: Address[]) => {
	const chainId = useChainId();
	const contractAddress = getVaultRegistryAddress(chainId);

	const contracts = useMemo(() => {
		if (vaultAddresses.length === 0 || contractAddress === '0x0000000000000000000000000000000000000000') {
			return [];
		}

		return vaultAddresses.map(
			(vaultAddress) =>
				({
					address: contractAddress,
					abi: VAULT_REGISTRY_ABI,
					functionName: 'getVaultInfo',
					args: [vaultAddress],
				}) as const,
		);
	}, [vaultAddresses, contractAddress]);

	const result = useReadContracts({
		contracts,
		query: {
			enabled: contracts.length > 0,
			staleTime: 60000, // 60 seconds - vault info doesn't change frequently
		},
	});

	return result;
};

// Hook to get underlying asset names for better vault naming
const useAssetNames = (assetAddresses: Address[]) => {
	const contracts = useMemo(() => {
		if (assetAddresses.length === 0) return [];

		return assetAddresses.flatMap((assetAddress) => [
			{
				address: assetAddress,
				abi: ERC20_ABI,
				functionName: 'name',
			} as const,
			{
				address: assetAddress,
				abi: ERC20_ABI,
				functionName: 'symbol',
			} as const,
		]);
	}, [assetAddresses]);

	const result = useReadContracts({
		contracts,
		query: {
			enabled: contracts.length > 0,
			staleTime: 300000, // 5 minutes - cToken names rarely change
		},
	});

	return result;
};

// Hook to get detailed vault information for a specific collection
const useCollectionVaults = (collectionId: bigint | null, vaultAddresses: Address[], userAddress?: Address) => {
	const contracts = useMemo(() => {
		if (!collectionId || vaultAddresses.length === 0) return [];

		const baseContracts = vaultAddresses.map(
			(vaultAddress) =>
				({
					address: vaultAddress,
					abi: COLLECTIONS_VAULT_ABI,
					functionName: 'totalAssets',
					args: [collectionId],
				}) as const,
		);

		// Add user-specific contracts if userAddress is provided
		if (userAddress) {
			const userContracts = vaultAddresses.map(
				(vaultAddress) =>
					({
						address: vaultAddress,
						abi: COLLECTIONS_VAULT_ABI,
						functionName: 'balanceOf',
						args: [userAddress, collectionId], // ERC1155 pattern: (account, id)
					}) as const,
			);
			return [...baseContracts, ...userContracts];
		}

		return baseContracts;
	}, [collectionId, vaultAddresses, userAddress]);

	return useReadContracts({
		contracts,
		query: {
			enabled: contracts.length > 0,
			staleTime: 30000, // 30 seconds
		},
	});
};

// Hook to get all supported vault addresses
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
			staleTime: 60000, // 60 seconds
		},
	});
};

// Hook to get debt subsidizer data for yield metrics
const useDebtSubsidizerData = (vaultAddresses: Address[]) => {
	const chainId = useChainId();
	const contractAddress = getDebtSubsidizerAddress(chainId);

	const contracts = useMemo(() => {
		if (vaultAddresses.length === 0 || contractAddress === '0x0000000000000000000000000000000000000000') {
			return [];
		}

		return vaultAddresses.flatMap((vaultAddress) => [
			{
				address: contractAddress,
				abi: DEBT_SUBSIDIZER_ABI,
				functionName: 'getTotalSubsidies',
				args: [vaultAddress],
			} as const,
			{
				address: contractAddress,
				abi: DEBT_SUBSIDIZER_ABI,
				functionName: 'getTotalSubsidiesClaimed',
				args: [vaultAddress],
			} as const,
			{
				address: contractAddress,
				abi: DEBT_SUBSIDIZER_ABI,
				functionName: 'getRemainingSubsidies',
				args: [vaultAddress],
			} as const,
		]);
	}, [vaultAddresses, contractAddress]);

	return useReadContracts({
		contracts,
		query: {
			enabled: contracts.length > 0,
			staleTime: 30000, // 30 seconds
		},
	});
};

// Main hook for collection detail data
export const useCollectionDetailData = (collectionAddress: Address) => {
	// Get current user's address
	const { address: userAddress } = useAccount();

	// Get base collection data from the existing hook
	const { collections, loading: baseLoading, error: baseError, refetch: baseRefetch } = useCollectionsPageData();

	// Get registry collections to access the correct collection IDs
	const {
		collectionsWithDetails: registryCollections,
		loading: registryLoading,
		error: registryError,
	} = useAllActiveCollectionsWithDetails();

	// Find the specific collection
	const baseCollectionData = useMemo(() => {
		return collections.find((c) => c.collectionAddress.toLowerCase() === collectionAddress.toLowerCase());
	}, [collections, collectionAddress]);

	// Get the collection ID from registry data
	const collectionRegistryData = useMemo(() => {
		return registryCollections?.find(
			(c) => c.details.originalAddress.toLowerCase() === collectionAddress.toLowerCase(),
		);
	}, [registryCollections, collectionAddress]);

	// Get vault addresses
	const { data: vaultAddressesData } = useAllSupportedVaults();
	const vaultAddresses = useMemo(() => {
		const addresses = vaultAddressesData?.[0]?.result || [];
		return [...addresses] as Address[];
	}, [vaultAddressesData]);

	// Get collection ID from registry data (correct way)
	const collectionId = useMemo(() => {
		return collectionRegistryData?.id || null;
	}, [collectionRegistryData]);

	// Get vault names from registry
	const {
		data: vaultNamesData,
		isLoading: vaultNamesLoading,
	} = useVaultNames(vaultAddresses);

	// Extract underlying asset addresses from vault registry data for asset name lookup
	const assetAddresses = useMemo(() => {
		if (!vaultNamesData || vaultNamesData.length === 0) return [];

		return vaultNamesData
			.map((vaultResult) => {
				if (vaultResult?.status === 'success' && vaultResult.result) {
					const result = vaultResult.result;

					// Extract asset address - it's the 2nd element in the struct (index 1)
					if (result && typeof result === 'object' && 'asset' in result && result.asset) {
						return result.asset as Address;
					}
					// Try array access as fallback
					if (Array.isArray(result) && result.length >= 2 && result[1]) {
						return result[1] as Address;
					}
				}
				return '0x0000000000000000000000000000000000000000' as Address;
			})
			.filter((addr) => addr !== '0x0000000000000000000000000000000000000000');
	}, [vaultNamesData]);

	// Get asset names for better vault naming
	const {
		data: assetNamesData,
		isLoading: assetNamesLoading,
	} = useAssetNames(assetAddresses);

	// Get vault data for this collection
	const {
		data: vaultData,
		isLoading: vaultDataLoading,
	} = useCollectionVaults(collectionId, vaultAddresses, userAddress);

	// Get debt subsidizer data for yield metrics
	const {
		data: debtSubsidizerData,
		isLoading: debtSubsidizerLoading,
	} = useDebtSubsidizerData(vaultAddresses);

	// Transform vault data into VaultInfo objects
	const vaults = useMemo((): VaultInfo[] => {
		if (!vaultData || vaultAddresses.length === 0) return [];

		const hasUserData = !!userAddress;
		const baseContractsPerVault = 1; // Only totalAssets now
		const totalBaseContracts = vaultAddresses.length * baseContractsPerVault;

		return vaultAddresses.map((vaultAddress, index) => {
			// Base data (totalAssets) comes first
			const totalAssetsIndex = index * baseContractsPerVault;

			// User data (balanceOf) comes after all base data
			const userBalanceIndex = hasUserData ? totalBaseContracts + index : -1;

			const totalAssetsResult = vaultData[totalAssetsIndex];
			const userBalanceResult = userBalanceIndex >= 0 ? vaultData[userBalanceIndex] : null;

			// Convert from wei to readable format (assuming 18 decimals for vault tokens)
			const totalAssets = totalAssetsResult?.result ? totalAssetsResult.result : 0n;
			const userBalance = userBalanceResult?.result ? userBalanceResult.result : 0n;

			// Get vault name using underlying asset name + "Vault" for better naming
			let vaultName = `Vault #${index + 1}`; // Default fallback

			// First priority: Use asset name + "Vault"
			if (assetNamesData && index * 2 + 1 < assetNamesData.length) {
				const nameIndex = index * 2;
				const symbolIndex = index * 2 + 1;
				const nameResult = assetNamesData[nameIndex];
				const symbolResult = assetNamesData[symbolIndex];

				// Try asset name first
				if (nameResult?.status === 'success' && nameResult.result && String(nameResult.result).trim() !== '') {
					vaultName = `${nameResult.result} Vault`;
				}
				// Try asset symbol as fallback (more common and shorter)
				else if (
					symbolResult?.status === 'success' &&
					symbolResult.result &&
					String(symbolResult.result).trim() !== ''
				) {
					vaultName = `${symbolResult.result} Vault`;
				}
			}

			// Second priority: Use vault registry name/symbol if asset lookup failed
			if (vaultName === `Vault #${index + 1}`) {
				const vaultInfoResult = vaultNamesData?.[index];

				if (vaultInfoResult?.status === 'success' && vaultInfoResult.result) {
					const result = vaultInfoResult.result;

					// Try accessing as object properties (typed struct)
					if (result && typeof result === 'object') {
						const vaultInfo = result as VaultRegistryInfo;

						// Direct property access for struct
						if ('name' in vaultInfo && vaultInfo.name && vaultInfo.name.trim() !== '') {
							vaultName = `${vaultInfo.name} Vault`;
						}
						// Try symbol as fallback for struct
						else if ('symbol' in vaultInfo && vaultInfo.symbol && vaultInfo.symbol.trim() !== '') {
							vaultName = `${vaultInfo.symbol} Vault`;
						}
						// Array access (tuple as array) - fallback for different viem versions
						else if (Array.isArray(result)) {
							const resultArray = result as unknown[];
							if (resultArray.length >= 5 && resultArray[4] && String(resultArray[4]).trim() !== '') {
								vaultName = `${String(resultArray[4])} Vault`; // name is 5th element (index 4)
							} else if (
								resultArray.length >= 6 &&
								resultArray[5] &&
								String(resultArray[5]).trim() !== ''
							) {
								vaultName = `${String(resultArray[5])} Vault`; // symbol is 6th element (index 5)
							}
						}
					}
				}
			}

			// Final fallback: Use address-based name if all else fails
			if (vaultName === `Vault #${index + 1}`) {
				vaultName = `${vaultAddress.slice(0, 8)}...${vaultAddress.slice(-4)} Vault`;
			}

			return {
				address: vaultAddress,
				name: vaultName,
				totalAssets: FormattingService.formatTokenBalance(totalAssets, 18, ''), // Remove token symbol for cleaner display
				status: totalAssets > 0n ? 'Active' : 'Inactive',
				userBalance: FormattingService.formatTokenBalance(userBalance, 18, ''),
				userShares: FormattingService.formatTokenBalance(userBalance, 18, ''), // For ERC1155 vaults, balance equals shares
			};
		});
	}, [vaultData, vaultAddresses, userAddress, vaultNamesData, assetNamesData]);

	// Calculate total value locked from vault data
	const totalValueLocked = useMemo(() => {
		if (!vaultData || vaultAddresses.length === 0) return '0';

		let totalAssetsSum = 0n;
		const baseContractsPerVault = 2; // totalAssets, totalSupply

		// Sum up totalAssets from all vaults (first contract result per vault)
		for (let index = 0; index < vaultAddresses.length; index++) {
			const totalAssetsIndex = index * baseContractsPerVault;
			const totalAssetsResult = vaultData[totalAssetsIndex];
			if (totalAssetsResult?.result) {
				totalAssetsSum += totalAssetsResult.result;
			}
		}

		return FormattingService.formatTokenBalance(totalAssetsSum, 18, '');
	}, [vaultData, vaultAddresses]);

	// Calculate total yield generated from debt subsidizer data
	const totalYieldGenerated = useMemo(() => {
		if (!debtSubsidizerData || vaultAddresses.length === 0) return '0';

		let totalClaimedSum = 0n;
		// The data comes in groups of 3 per vault: totalSubsidies, totalClaimed, remaining
		for (let vaultIndex = 0; vaultIndex < vaultAddresses.length; vaultIndex++) {
			const totalClaimedIndex = vaultIndex * 3 + 1; // Second call per vault is totalClaimed
			const result = debtSubsidizerData[totalClaimedIndex];
			if (result?.result) {
				totalClaimedSum += result.result;
			}
		}

		return FormattingService.formatTokenBalance(totalClaimedSum, 18, '');
	}, [debtSubsidizerData, vaultAddresses]);

	// Create the complete collection detail data
	const collectionDetailData = useMemo((): CollectionDetailData | null => {
		if (!baseCollectionData) return null;

		// Get weight function parameters from registry data
		const weightFunctionParams = collectionRegistryData?.details.weightFunction;
		// Convert from wei-scale (1e18) to regular numbers for weight function coefficients
		const p1 = weightFunctionParams ? Number(weightFunctionParams.p1) / 1e18 : 100;
		const p2 = weightFunctionParams ? Number(weightFunctionParams.p2) / 1e18 : 0;

		// Generate weight function parameters
		const weightFunction = CollectionService.parseWeightFunctionParameters(
			baseCollectionData.weightFunction?.type || 'LINEAR',
			BigInt(Math.round(p1 * 1e18)), // Convert back to BigInt with proper scaling for service
			BigInt(Math.round(p2 * 1e18)),
		);

		// Get creation date from registry data
		const createdAt = collectionRegistryData?.details.registeredAt
			? new Date(Number(collectionRegistryData.details.registeredAt) * 1000).toISOString().split('T')[0]
			: '2024-01-15'; // Fallback

		return {
			...baseCollectionData,
			vaults,
			totalValueLocked,
			totalYieldGenerated,
			createdAt,
			weightFunctionParameters: {
				fnType: baseCollectionData.weightFunction?.type || 'LINEAR',
				p1: Math.round(p1), // Use the scaled-down values for display
				p2: Math.round(p2),
				formula: weightFunction.formula,
				description: weightFunction.description,
			},
		};
	}, [baseCollectionData, vaults, totalValueLocked, totalYieldGenerated, collectionRegistryData]);

	// Combined loading state - prioritize critical data
	const isLoading = useMemo(() => {
		// Always show loading if base collection data is loading
		if (baseLoading || registryLoading) return true;

		// Show loading if we have collection data but vault data is still loading
		if (baseCollectionData && (vaultDataLoading || vaultNamesLoading || assetNamesLoading || debtSubsidizerLoading))
			return true;

		return false;
	}, [
		baseLoading,
		registryLoading,
		baseCollectionData,
		vaultDataLoading,
		vaultNamesLoading,
		assetNamesLoading,
		debtSubsidizerLoading,
	]);

	// Combined error state with error prioritization
	const error = useMemo(() => {
		// Registry errors are critical - without collection data, we can't show anything
		if (registryError || baseError) return registryError || baseError;

		// Vault errors are important but not critical

		// Debt subsidizer errors, vault names errors, asset names errors, and vault address errors are logged but don't break the UI

		return null; // Don't show error state for non-critical errors
	}, [registryError, baseError]);

	// Combined refetch with proper error recovery
	const refetch = useMemo(() => {
		return () => {
			baseRefetch();
			// Registry refetch is handled by baseRefetch since it uses the same underlying hook
		};
	}, [baseRefetch]);

	// Data availability status for granular loading states
	const dataStatus = useMemo(() => {
		return {
			hasBaseData: !!baseCollectionData,
			hasRegistryData: !!collectionRegistryData,
			hasVaultData: !!vaultData && vaultData.length > 0,
			hasVaultNames: !!vaultNamesData && vaultNamesData.length > 0,
			hasDebtSubsidizerData: !!debtSubsidizerData && debtSubsidizerData.length > 0,
			hasUserData: !!userAddress,
		};
	}, [baseCollectionData, collectionRegistryData, vaultData, vaultNamesData, debtSubsidizerData, userAddress]);

	return {
		collectionData: collectionDetailData,
		loading: isLoading,
		error,
		refetch,
		isEmpty: !collectionDetailData,
		dataStatus, // Expose data status for component-level optimization
	};
};

// Hook specifically for vault details
export const useVaultDetails = (vaultAddress: Address, collectionId: bigint) => {
	const { data, error, isLoading } = useReadContracts({
		contracts: [
			{
				address: vaultAddress,
				abi: COLLECTIONS_VAULT_ABI,
				functionName: 'totalAssets',
				args: [collectionId],
			} as const,
			{
				address: vaultAddress,
				abi: COLLECTIONS_VAULT_ABI,
				functionName: 'totalAssets',
				args: [collectionId],
			} as const,
			// TODO: Add more vault-specific calls
		],
		query: {
			enabled: !!vaultAddress && !!collectionId,
			staleTime: 15000, // 15 seconds - more frequent updates for individual vault
		},
	});

	const vaultInfo = useMemo((): VaultInfo | null => {
		if (!data) return null;

		const [totalAssetsResult] = data;
		const totalAssets = totalAssetsResult?.result ? Number(totalAssetsResult.result) : 0;

		return {
			address: vaultAddress,
			name: `${vaultAddress.slice(0, 8)}...${vaultAddress.slice(-6)}`,
			totalAssets: totalAssets.toLocaleString(),
			status: totalAssets > 0 ? 'Active' : 'Inactive',
			userBalance: '0', // TODO: Get user balance
			userShares: '0', // TODO: Get user shares
		};
	}, [data, vaultAddress]);

	return {
		vaultInfo,
		loading: isLoading,
		error,
	};
};

// Re-export types for components to use
export type { CollectionDetailData, VaultInfo } from '../ui/collection-detail-page/collection-detail-page.component';
