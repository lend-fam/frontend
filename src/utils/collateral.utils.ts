import type { Address } from 'viem';

export function isMarketCollateralEnabled(userEnteredMarkets: Address[] | undefined, marketAddress: Address): boolean {
	if (!userEnteredMarkets) return false;
	return userEnteredMarkets.includes(marketAddress);
}

export function getCollateralStatusForAllMarkets(
	userEnteredMarkets: Address[] | undefined,
	allMarkets: Address[] | undefined,
): Record<string, boolean> {
	if (!allMarkets) return {};

	const collateralStatus: Record<string, boolean> = {};

	allMarkets.forEach((marketAddress) => {
		collateralStatus[marketAddress] = isMarketCollateralEnabled(userEnteredMarkets, marketAddress);
	});

	return collateralStatus;
}

export function getEnabledCollateralMarkets(userEnteredMarkets: Address[] | undefined): Address[] {
	return userEnteredMarkets || [];
}

export function getSupplyOnlyMarkets(
	userEnteredMarkets: Address[] | undefined,
	userSupplyPositions: Record<string, { hasSupplied: boolean }> | undefined,
): Address[] {
	if (!userSupplyPositions) return [];

	const suppliedMarkets = Object.entries(userSupplyPositions)
		.filter(([, position]) => position.hasSupplied)
		.map(([marketAddress]) => marketAddress as Address);

	const enteredMarkets = userEnteredMarkets || [];

	return suppliedMarkets.filter((marketAddress) => !enteredMarkets.includes(marketAddress));
}

export function canExitMarket(
	marketAddress: Address,
	userBorrowPositions: Record<string, { hasBorrowed: boolean; balance: bigint }> | undefined,
): { canExit: boolean; reason?: string } {
	if (!userBorrowPositions) {
		return { canExit: true };
	}

	const borrowPosition = userBorrowPositions[marketAddress];

	if (borrowPosition?.hasBorrowed && borrowPosition.balance > 0n) {
		// Allow exit if debt is below dust threshold (0.000000001 tokens = 1e9 wei for 18 decimal tokens)
		const dustThreshold = 1000000000n; // 1e9 wei
		
		if (borrowPosition.balance <= dustThreshold) {
			return { canExit: true };
		}

		return {
			canExit: false,
			reason: 'Cannot exit market with outstanding borrow balance',
		};
	}

	return { canExit: true };
}
