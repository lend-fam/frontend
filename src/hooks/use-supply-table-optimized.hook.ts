import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { useDashboardOptimized } from './use-dashboard-optimized.hook';
import { useUserMarkets, useUSDBalances, useNativeYield } from './index';
import { useTokenMetadata } from './use-token-metadata.hook';
import { MarketService, TokenService } from '../services';

export type SupplyTableData = {
	assets: string;
	balance: string;
	apy: string;
	collateral: string;
	actions: string;
	marketAddress: Address;
	tokenAmount: string;
	usdValue: string;
	symbol: string;
	isCollateralEnabled: boolean;
	isCollateralEligible: boolean;
	hasSupplied: boolean;
	supplyAPY: string;
	walletBalance: bigint;
	nativeYieldAPY?: string;
	hasNativeYield?: boolean;
};

/**
 * Optimized hook for supply table data that uses pre-loaded dashboard data
 */
export function useSupplyTableOptimized() {
	const { address: userAddress } = useAccount();
	const { 
		data: dashboardData, 
		isLoading: dashboardLoading,
		marketMetadata,
		userSupplyPositions,
		walletBalances,
		apyData
	} = useDashboardOptimized();

	const marketAddresses = Object.keys(marketMetadata) as Address[];
	const { data: userMarkets } = useUserMarkets(userAddress);
	const { data: nativeYieldData } = useNativeYield();
	const { data: tokenMetadata, isLoading: tokenMetadataLoading } = useTokenMetadata(marketAddresses);

	// Prepare balance data for USD conversion
	const balanceData = useMemo(() => {
		return Object.entries(userSupplyPositions)
			.filter(([, data]) => data.balance > 0n)
			.map(([marketAddress, data]) => {
				const metadata = marketMetadata[marketAddress as Address];
				return {
					marketAddress: marketAddress as Address,
					balance: data.balance,
					symbol: TokenService.formatMarketName(undefined, undefined, marketAddress as Address, tokenMetadata?.[marketAddress as Address]),
					decimals: Number(metadata?.underlyingDecimals || 18n),
				};
			});
	}, [userSupplyPositions, marketMetadata, tokenMetadata]);

	const { data: usdBalances, isLoading: usdLoading } = useUSDBalances(balanceData);

	const { suppliedMarketsData, availableMarketsData } = useMemo(() => {
		if (dashboardLoading || !marketAddresses.length) {
			return { suppliedMarketsData: [], availableMarketsData: [] };
		}

		const supplied: SupplyTableData[] = [];
		const available: SupplyTableData[] = [];

		marketAddresses.forEach((marketAddress) => {
			const metadata = marketMetadata[marketAddress];
			const tokenMeta = tokenMetadata?.[marketAddress];
			const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress, tokenMeta);
			const apy = apyData[marketAddress];
			const baseAPY = parseFloat(apy?.supplyAPY || '0.00');
			const userPosition = userSupplyPositions[marketAddress];
			const hasSupplied = userPosition?.hasSupplied || false;

			const underlyingBalance = userPosition?.balance || 0n;
			const decimals = Number(metadata?.underlyingDecimals || 18n);
			const tokenAmount = hasSupplied ? MarketService.formatTokenBalance(underlyingBalance, decimals) : '0';

			const isCollateralEnabled = userMarkets?.includes(marketAddress) || false;
			const isCollateralEligible = true;

			const symbol = tokenMeta?.underlyingSymbol || displayName.replace('Market ', '').split(' ')[0];
			const walletBalance = walletBalances[marketAddress] || 0n;

			// Check if this is APE token and show native yield APY if available
			const isAPEToken = symbol.toUpperCase() === 'APE';
			const hasNativeYield = isAPEToken && nativeYieldData?.apy && parseFloat(nativeYieldData.apy) > 0;
			const nativeYieldAPY = hasNativeYield ? `${nativeYieldData?.apy}%` : undefined;

			const marketData: SupplyTableData = {
				assets: displayName,
				balance: tokenAmount,
				apy: `${baseAPY.toFixed(2)}%`,
				collateral: isCollateralEnabled ? 'enabled' : 'disabled',
				actions: '',
				marketAddress,
				tokenAmount,
				usdValue: usdBalances?.[marketAddress] || '0',
				symbol,
				isCollateralEnabled,
				isCollateralEligible,
				hasSupplied,
				supplyAPY: `${baseAPY.toFixed(2)}%`,
				walletBalance,
				nativeYieldAPY,
				hasNativeYield: !!hasNativeYield,
			};

			if (hasSupplied) {
				supplied.push(marketData);
			} else {
				available.push(marketData);
			}
		});

		return {
			suppliedMarketsData: supplied,
			availableMarketsData: available,
		};
	}, [
		dashboardLoading,
		marketAddresses,
		marketMetadata,
		tokenMetadata,
		apyData,
		userSupplyPositions,
		userMarkets,
		walletBalances,
		usdBalances,
		nativeYieldData,
	]);

	const isLoading = dashboardLoading || usdLoading || tokenMetadataLoading;

	return {
		suppliedMarketsData,
		availableMarketsData,
		isLoading,
		tokenMetadata,
	};
}