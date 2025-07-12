import { useReadContract, useReadContracts, useChainId } from 'wagmi';
import { useMemo } from 'react';
import type { Address } from 'viem';
import { COMPTROLLER_ABI, CTOKEN_ABI, getComptrollerAddress } from '../contracts';
import { MarketService } from '../services/market.service';

/**
 * Hook to fetch all available markets from the Comptroller
 */
export function useAllMarkets() {
	const chainId = useChainId();

	return useReadContract({
		address: getComptrollerAddress(chainId),
		abi: COMPTROLLER_ABI,
		functionName: 'getAllMarkets',
		query: {
			staleTime: 60000,
			refetchInterval: 60000,
		},
	});
}

/**
 * Hook to fetch market information for a specific CToken
 */
export function useMarket(marketAddress: Address) {
	const chainId = useChainId();

	return useReadContracts({
		contracts: [
			{
				address: getComptrollerAddress(chainId),
				abi: COMPTROLLER_ABI,
				functionName: 'markets',
				args: [marketAddress],
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'name',
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'symbol',
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'underlying',
			},
		],
		query: {
			staleTime: 60000,
		},
	});
}

/**
 * Hook to fetch detailed market data including rates and balances
 */
export function useMarketData(marketAddress: Address) {
	return useReadContracts({
		contracts: [
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'supplyRatePerBlock',
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'borrowRatePerBlock',
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'totalSupply',
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'totalBorrows',
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'exchangeRateStored',
			},
		],
		query: {
			staleTime: 30000,
			refetchInterval: 30000,
		},
	});
}

/**
 * Hook to fetch user's position in a specific market
 */
export function useUserMarketPosition(marketAddress: Address, userAddress?: Address) {
	return useReadContracts({
		contracts: [
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'balanceOf',
				args: userAddress ? [userAddress] : undefined,
			},
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'borrowBalanceStored',
				args: userAddress ? [userAddress] : undefined,
			},
		],
		query: {
			enabled: !!userAddress,
			staleTime: 10000,
			refetchInterval: 10000,
		},
	});
}

/**
 * Hook to fetch user's account liquidity
 */
export function useAccountLiquidity(userAddress?: Address) {
	const chainId = useChainId();

	return useReadContract({
		address: getComptrollerAddress(chainId),
		abi: COMPTROLLER_ABI,
		functionName: 'getAccountLiquidity',
		args: userAddress ? [userAddress] : undefined,
		query: {
			enabled: !!userAddress,
			staleTime: 5000,
			refetchInterval: false,
			retry: 3,
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
		},
	});
}

/**
 * Hook to fetch markets that the user has entered (for collateral)
 */
export function useUserMarkets(userAddress?: Address) {
	const chainId = useChainId();

	const result = useReadContract({
		address: getComptrollerAddress(chainId),
		abi: COMPTROLLER_ABI,
		functionName: 'getAssetsIn',
		args: userAddress ? [userAddress] : undefined,
		query: {
			enabled: !!userAddress,
			staleTime: 5000,
			refetchInterval: false,
			retry: 3,
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
		},
	});

	return {
		...result,
		queryKey: result.queryKey,
	};
}

/**
 * Hook to fetch user supply positions for all markets
 */
export function useUserSupplyPositions(userAddress?: Address) {
	const { data: marketAddresses, isLoading: marketsLoading } = useAllMarkets();

	const marketBalanceContracts =
		marketAddresses?.map((address: Address) => ({
			address,
			abi: CTOKEN_ABI,
			functionName: 'balanceOfUnderlying',
			args: userAddress ? [userAddress] : undefined,
		})) || [];

	const { data: contractResults, isLoading: dataLoading } = useReadContracts({
		contracts: marketBalanceContracts,
		query: {
			enabled: !!userAddress && !!marketAddresses && marketAddresses.length > 0,
			staleTime: 5000,
			refetchInterval: false,
		},
	});

	const processedData = useMemo(() => {
		if (!marketAddresses || !contractResults || !userAddress) return {};

		const positionData: Record<Address, { balance: bigint; hasSupplied: boolean }> = {};

		marketAddresses.forEach((address: Address, index: number) => {
			const balanceResult = contractResults[index];
			const balance = balanceResult?.result ? (balanceResult.result as bigint) : 0n;

			positionData[address] = {
				balance,
				hasSupplied: balance > 0n,
			};
		});

		return positionData;
	}, [marketAddresses, contractResults, userAddress]);

	return {
		data: processedData,
		isLoading: marketsLoading || dataLoading,
	};
}

/**
 * Hook to fetch user borrow positions for all markets
 */
export function useUserBorrowPositions(userAddress?: Address) {
	const { data: marketAddresses, isLoading: marketsLoading } = useAllMarkets();

	const marketBorrowContracts =
		marketAddresses?.map((address: Address) => ({
			address,
			abi: CTOKEN_ABI,
			functionName: 'borrowBalanceStored',
			args: userAddress ? [userAddress] : undefined,
		})) || [];

	const { data: contractResults, isLoading: dataLoading } = useReadContracts({
		contracts: marketBorrowContracts,
		query: {
			enabled: !!userAddress && !!marketAddresses && marketAddresses.length > 0,
			staleTime: 5000,
			refetchInterval: false,
		},
	});

	const processedData = useMemo(() => {
		if (!marketAddresses || !contractResults || !userAddress) return {};

		const positionData: Record<Address, { balance: bigint; hasBorrowed: boolean }> = {};

		marketAddresses.forEach((address: Address, index: number) => {
			const balanceResult = contractResults[index];
			const balance = balanceResult?.result ? (balanceResult.result as bigint) : 0n;

			positionData[address] = {
				balance,
				hasBorrowed: balance > 0n,
			};
		});

		return positionData;
	}, [marketAddresses, contractResults, userAddress]);

	return {
		data: processedData,
		isLoading: marketsLoading || dataLoading,
	};
}

/**
 * Hook to fetch available liquidity for borrowing in all markets
 */
export function useMarketsAvailableLiquidity() {
	const { data: marketAddresses, isLoading: marketsLoading } = useAllMarkets();

	const liquidityContracts =
		marketAddresses?.map((address: Address) => ({
			address,
			abi: CTOKEN_ABI,
			functionName: 'getCash',
		})) || [];

	const { data: contractResults, isLoading: dataLoading } = useReadContracts({
		contracts: liquidityContracts,
		query: {
			enabled: !!marketAddresses && marketAddresses.length > 0,
			staleTime: 30000,
			refetchInterval: 30000,
		},
	});

	const processedData = useMemo(() => {
		if (!marketAddresses || !contractResults) return {};

		const liquidityData: Record<Address, bigint> = {};

		marketAddresses.forEach((address: Address, index: number) => {
			const liquidityResult = contractResults[index];
			const availableLiquidity = liquidityResult?.result ? (liquidityResult.result as bigint) : 0n;
			liquidityData[address] = availableLiquidity;
		});

		return liquidityData;
	}, [marketAddresses, contractResults]);

	return {
		data: processedData,
		isLoading: marketsLoading || dataLoading,
	};
}

/**
 * Hook to fetch APY data for all markets
 */
export function useMarketsAPY() {
	const { data: marketAddresses, isLoading: marketsLoading } = useAllMarkets();

	const marketDataContracts =
		marketAddresses?.flatMap((address: Address) => [
			{
				address,
				abi: CTOKEN_ABI,
				functionName: 'supplyRatePerBlock',
			},
			{
				address,
				abi: CTOKEN_ABI,
				functionName: 'borrowRatePerBlock',
			},
		]) || [];

	const { data: contractResults, isLoading: dataLoading } = useReadContracts({
		contracts: marketDataContracts,
		query: {
			enabled: !!marketAddresses && marketAddresses.length > 0,
			staleTime: 30000,
			refetchInterval: 30000,
		},
	});

	const processedData = useMemo(() => {
		if (!marketAddresses || !contractResults) return {};

		const apyData: Record<Address, { supplyAPY: string; borrowAPY: string }> = {};

		marketAddresses.forEach((address: Address, index: number) => {
			const supplyRateResult = contractResults[index * 2];
			const borrowRateResult = contractResults[index * 2 + 1];

			const supplyAPY = supplyRateResult?.result
				? MarketService.calculateSupplyAPY(supplyRateResult.result as bigint)
				: '0.00';

			const borrowAPY = borrowRateResult?.result
				? MarketService.calculateBorrowAPY(borrowRateResult.result as bigint)
				: '0.00';

			apyData[address] = { supplyAPY, borrowAPY };
		});

		return apyData;
	}, [marketAddresses, contractResults]);

	return {
		data: processedData,
		isLoading: marketsLoading || dataLoading,
	};
}

/**
 * Hook to fetch exchange rates for all markets
 */
export function useMarketsExchangeRates() {
	const { data: marketAddresses, isLoading: marketsLoading } = useAllMarkets();

	const exchangeRateContracts =
		marketAddresses?.map((address: Address) => ({
			address,
			abi: CTOKEN_ABI,
			functionName: 'exchangeRateStored',
		})) || [];

	const { data: contractResults, isLoading: dataLoading } = useReadContracts({
		contracts: exchangeRateContracts,
		query: {
			enabled: !!marketAddresses && marketAddresses.length > 0,
			staleTime: 30000,
			refetchInterval: 30000,
		},
	});

	const processedData = useMemo(() => {
		if (!marketAddresses || !contractResults) return {};

		const exchangeRateData: Record<Address, bigint> = {};

		marketAddresses.forEach((address: Address, index: number) => {
			const exchangeRateResult = contractResults[index];
			const exchangeRate = exchangeRateResult?.result ? (exchangeRateResult.result as bigint) : 0n;

			exchangeRateData[address] = exchangeRate;
		});

		return exchangeRateData;
	}, [marketAddresses, contractResults]);

	return {
		data: processedData,
		isLoading: marketsLoading || dataLoading,
	};
}

/**
 * Hook to fetch collateral factors for all markets
 */
export function useMarketsCollateralFactors() {
	const chainId = useChainId();
	const { data: marketAddresses, isLoading: marketsLoading } = useAllMarkets();

	const collateralFactorContracts =
		marketAddresses?.map((address: Address) => ({
			address: getComptrollerAddress(chainId),
			abi: COMPTROLLER_ABI,
			functionName: 'markets',
			args: [address],
		})) || [];

	const { data: contractResults, isLoading: dataLoading } = useReadContracts({
		contracts: collateralFactorContracts,
		query: {
			enabled: !!marketAddresses && marketAddresses.length > 0,
			staleTime: 60000,
			refetchInterval: 60000,
		},
	});

	const processedData = useMemo(() => {
		if (!marketAddresses || !contractResults) return {};

		const collateralFactorData: Record<Address, number> = {};

		marketAddresses.forEach((address: Address, index: number) => {
			const marketResult = contractResults[index];
			if (marketResult?.result) {
				const marketData = marketResult.result as unknown;
				if (Array.isArray(marketData) && marketData.length >= 2) {
					const [, collateralFactorMantissa] = marketData as [boolean, bigint, boolean];
					const collateralFactor = Number(collateralFactorMantissa) / 1e18;
					collateralFactorData[address] = collateralFactor;
				}
			}
		});

		return collateralFactorData;
	}, [marketAddresses, contractResults]);

	return {
		data: processedData,
		isLoading: marketsLoading || dataLoading,
	};
}

/**
 * Combined hook to get all markets with their data
 */
export function useMarketsWithData() {
	const { data: marketAddresses, isLoading: marketsLoading, error: marketsError } = useAllMarkets();

	return {
		data: marketAddresses,
		isLoading: marketsLoading,
		error: marketsError,
	};
}
