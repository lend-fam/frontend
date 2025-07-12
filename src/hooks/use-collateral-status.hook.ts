import { useMemo } from 'react';
import type { Address } from 'viem';
import { useUserMarkets, useAllMarkets, useUserSupplyPositions, useUserBorrowPositions } from './use-markets.hook';
import {
	getCollateralStatusForAllMarkets,
	getEnabledCollateralMarkets,
	getSupplyOnlyMarkets,
	canExitMarket,
} from '../utils/collateral.utils';

/**
 * Hook to get comprehensive collateral status for a user
 * @param userAddress - The user's wallet address
 * @returns Object with collateral status data and utility functions
 */
export function useCollateralStatus(userAddress?: Address) {
	const { data: allMarkets } = useAllMarkets();
	const { data: userEnteredMarkets } = useUserMarkets(userAddress);
	const { data: userSupplyPositions } = useUserSupplyPositions(userAddress);
	const { data: userBorrowPositions } = useUserBorrowPositions(userAddress);

	const collateralStatus = useMemo(() => {
		const mutableEnteredMarkets = userEnteredMarkets ? Array.from(userEnteredMarkets) : undefined;
		const mutableAllMarkets = allMarkets ? Array.from(allMarkets) : undefined;

		return {
			allMarketsStatus: getCollateralStatusForAllMarkets(mutableEnteredMarkets, mutableAllMarkets),
			enabledCollateralMarkets: getEnabledCollateralMarkets(mutableEnteredMarkets),
			supplyOnlyMarkets: getSupplyOnlyMarkets(mutableEnteredMarkets, userSupplyPositions),
			enteredMarkets: userEnteredMarkets || [],
			allMarkets: allMarkets || [],
		};
	}, [userEnteredMarkets, allMarkets, userSupplyPositions]);

	/**
	 * Check if a specific market has collateral enabled
	 */
	const isCollateralEnabled = (marketAddress: Address): boolean => {
		return collateralStatus.enabledCollateralMarkets.includes(marketAddress);
	};

	/**
	 * Check if user can exit a specific market
	 */
	const getExitabilityStatus = (marketAddress: Address) => {
		return canExitMarket(marketAddress, userBorrowPositions);
	};

	/**
	 * Get summary statistics
	 */
	const summary = useMemo(() => {
		return {
			totalMarkets: collateralStatus.allMarkets.length,
			enteredMarkets: collateralStatus.enteredMarkets.length,
			collateralEnabledCount: collateralStatus.enabledCollateralMarkets.length,
			supplyOnlyCount: collateralStatus.supplyOnlyMarkets.length,
		};
	}, [collateralStatus]);

	return {
		...collateralStatus,
		isCollateralEnabled,
		getExitabilityStatus,
		summary,
		isLoading: !allMarkets || !userEnteredMarkets,
	};
}

/**
 * Simple hook to check if a specific market has collateral enabled
 * @param userAddress - User's wallet address
 * @param marketAddress - Market address to check
 * @returns boolean indicating if collateral is enabled for this market
 */
export function useIsCollateralEnabled(userAddress?: Address, marketAddress?: Address): boolean {
	const { data: userEnteredMarkets } = useUserMarkets(userAddress);

	const result = useMemo(() => {
		if (!userEnteredMarkets || !marketAddress) {
			return false;
		}

		return userEnteredMarkets.includes(marketAddress);
	}, [userEnteredMarkets, marketAddress]);

	return result;
}
