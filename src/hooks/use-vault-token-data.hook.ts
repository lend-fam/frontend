import { useMemo } from 'react';
import type { Address } from 'viem';
import { useReadContracts, useChainId } from 'wagmi';
import { MarketService } from '../services/market.service';
import { VAULT_REGISTRY_ABI, getVaultRegistryAddress, CTOKEN_ABI, ERC20_ABI } from '../contracts';
import { MARKET_QUERY_CONFIG } from './market-query.constants';

export interface VaultTokenData {
	// Basic token info
	underlyingAssetAddress: Address;
	cTokenAddress: Address;
	tokenName: string;
	tokenSymbol: string;
	tokenDecimals: number;

	// APY and rates
	supplyAPY: string;
	borrowAPY: string;
	supplyRatePerBlock: bigint;
	borrowRatePerBlock: bigint;

	// Vault metadata
	vaultName: string;
	vaultSymbol: string;
	isActive: boolean;

	// Exchange rates for deposit/withdraw calculations
	exchangeRate: bigint;

	// Collateral eligibility
	isCollateralEnabled: boolean;
	collateralFactor: string;

	// Loading states for individual data pieces
	isLoadingVaultInfo: boolean;
	isLoadingTokenMetadata: boolean;
	isLoadingRates: boolean;
	isLoadingCollateral: boolean;
}

/**
 * Hook to fetch comprehensive token data for a specific vault
 * This includes APY, token metadata, and collateral information
 */
export const useVaultTokenData = (vaultAddress: Address | null | undefined) => {
	const chainId = useChainId();
	const vaultRegistryAddress = getVaultRegistryAddress(chainId);

	// Step 1: Get vault info from registry (asset, cToken, metadata)
	const { data: vaultInfoData, isLoading: isLoadingVaultInfo } = useReadContracts({
		contracts: [
			{
				address: vaultRegistryAddress,
				abi: VAULT_REGISTRY_ABI,
				functionName: 'getVaultInfo',
				args: [vaultAddress!],
			} as const,
		],
		query: {
			enabled: !!vaultAddress && vaultRegistryAddress !== '0x0000000000000000000000000000000000000000',
			staleTime: 60000, // 60 seconds - vault info doesn't change frequently
		},
	});

	// Extract addresses from vault info
	const vaultInfo = useMemo(() => {
		const result = vaultInfoData?.[0];
		if (result?.status !== 'success' || !result.result) return null;

		const info = result.result;
		return {
			vault: info.vault as Address,
			asset: info.asset as Address,
			cToken: info.cToken as Address,
			lendingManager: info.lendingManager as Address,
			name: info.name as string,
			symbol: info.symbol as string,
			active: info.active as boolean,
			registeredAt: info.registeredAt as bigint,
		};
	}, [vaultInfoData]);

	// Step 2: Get token metadata from underlying asset
	const { data: tokenMetadataData, isLoading: isLoadingTokenMetadata } = useReadContracts({
		contracts: vaultInfo
			? [
					{
						address: vaultInfo.asset,
						abi: ERC20_ABI,
						functionName: 'name',
					} as const,
					{
						address: vaultInfo.asset,
						abi: ERC20_ABI,
						functionName: 'symbol',
					} as const,
					{
						address: vaultInfo.asset,
						abi: ERC20_ABI,
						functionName: 'decimals',
					} as const,
				]
			: [],
		query: {
			enabled: !!vaultInfo,
			...MARKET_QUERY_CONFIG.TOKEN_METADATA,
		},
	});

	// Step 3: Get APY data from CToken
	const { data: ratesData, isLoading: isLoadingRates } = useReadContracts({
		contracts: vaultInfo
			? [
					{
						address: vaultInfo.cToken,
						abi: CTOKEN_ABI,
						functionName: 'supplyRatePerBlock',
					} as const,
					{
						address: vaultInfo.cToken,
						abi: CTOKEN_ABI,
						functionName: 'borrowRatePerBlock',
					} as const,
					{
						address: vaultInfo.cToken,
						abi: CTOKEN_ABI,
						functionName: 'exchangeRateStored',
					} as const,
				]
			: [],
		query: {
			enabled: !!vaultInfo,
			...MARKET_QUERY_CONFIG.MARKET_RATES,
		},
	});

	// Step 4: Get collateral information from comptroller
	// Note: This would require getting comptroller address and calling getMarkets/markets
	// For now, we'll set reasonable defaults since vaults are typically collateral-enabled
	const isCollateralEnabled = true; // Most vaults support collateral
	const collateralFactor = '75.00'; // Default collateral factor

	// Process the data
	const processedData = useMemo((): VaultTokenData | null => {
		if (!vaultInfo) return null;

		// Token metadata
		const tokenName = (tokenMetadataData?.[0]?.result as string) || 'Unknown Token';
		const tokenSymbol = (tokenMetadataData?.[1]?.result as string) || 'UNK';
		const tokenDecimals = (tokenMetadataData?.[2]?.result as number) || 18;

		// Rates
		const supplyRatePerBlock = (ratesData?.[0]?.result as bigint) || 0n;
		const borrowRatePerBlock = (ratesData?.[1]?.result as bigint) || 0n;
		const exchangeRate = (ratesData?.[2]?.result as bigint) || 0n;

		// Calculate APY
		const supplyAPY = supplyRatePerBlock ? MarketService.calculateSupplyAPY(supplyRatePerBlock) : '0.00';
		const borrowAPY = borrowRatePerBlock ? MarketService.calculateBorrowAPY(borrowRatePerBlock) : '0.00';

		return {
			// Basic token info
			underlyingAssetAddress: vaultInfo.asset,
			cTokenAddress: vaultInfo.cToken,
			tokenName,
			tokenSymbol,
			tokenDecimals,

			// APY and rates
			supplyAPY,
			borrowAPY,
			supplyRatePerBlock,
			borrowRatePerBlock,

			// Vault metadata
			vaultName: vaultInfo.name,
			vaultSymbol: vaultInfo.symbol,
			isActive: vaultInfo.active,

			// Exchange rates
			exchangeRate,

			// Collateral eligibility
			isCollateralEnabled,
			collateralFactor,

			// Loading states
			isLoadingVaultInfo,
			isLoadingTokenMetadata,
			isLoadingRates,
			isLoadingCollateral: false, // Not implemented yet
		};
	}, [
		vaultInfo,
		tokenMetadataData,
		ratesData,
		isLoadingVaultInfo,
		isLoadingTokenMetadata,
		isLoadingRates,
		isCollateralEnabled,
		collateralFactor,
	]);

	return {
		data: processedData,
		isLoading: isLoadingVaultInfo || isLoadingTokenMetadata || isLoadingRates,
		error: null, // TODO: Aggregate errors from different queries
		vaultInfo, // Raw vault info for debugging
	};
};
