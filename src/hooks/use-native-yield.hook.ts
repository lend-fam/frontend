import { useReadContracts, useAccount } from 'wagmi';
import { useMemo } from 'react';
import type { Address } from 'viem';
import {
	NATIVE_YIELD_ABI,
	ARB_OWNER_PUBLIC_ABI,
	ARB_INFO_ADDRESS,
	ARB_OWNER_PUBLIC_ADDRESS,
	parseYieldMode,
	type YieldMode,
} from '../contracts/native-yield.abi';
import { NativeYieldService } from '../services/native-yield.service';
import { MARKET_QUERY_CONFIG } from './market-query.constants';

export interface NativeYieldData {
	apy: string;
	yieldMode: YieldMode;
	sharePrice: string;
	shareCount: string;
	balanceValues: {
		fixed: bigint;
		shares: bigint;
		debt: bigint;
	};
	delegate: Address | null;
}

export function useNativeYieldAPY() {
	const { data: contractResults, isLoading } = useReadContracts({
		contracts: [
			{
				address: ARB_OWNER_PUBLIC_ADDRESS,
				abi: ARB_OWNER_PUBLIC_ABI,
				functionName: 'getApy',
			},
			{
				address: ARB_OWNER_PUBLIC_ADDRESS,
				abi: ARB_OWNER_PUBLIC_ABI,
				functionName: 'getSharePrice',
			},
			{
				address: ARB_OWNER_PUBLIC_ADDRESS,
				abi: ARB_OWNER_PUBLIC_ABI,
				functionName: 'getShareCount',
			},
		],
		query: {
			...MARKET_QUERY_CONFIG.MARKET_RATES,
		},
	});

	const processedData = useMemo(() => {
		if (!contractResults) return null;

		const [apyResult, sharePriceResult, shareCountResult] = contractResults;

		const apyRaw = apyResult?.result ? Number(apyResult.result as bigint) : 0;
		const apy = (apyRaw / 1000000000).toFixed(2);

		const sharePrice = sharePriceResult?.result ? (sharePriceResult.result as bigint).toString() : '0';
		const shareCount = shareCountResult?.result ? (shareCountResult.result as bigint).toString() : '0';

		return {
			apy,
			sharePrice,
			shareCount,
		};
	}, [contractResults]);

	return {
		data: processedData,
		isLoading,
	};
}

export function useUserNativeYield() {
	const { address } = useAccount();

	const { data: contractResults, isLoading } = useReadContracts({
		contracts: [
			{
				address: ARB_INFO_ADDRESS,
				abi: NATIVE_YIELD_ABI,
				functionName: 'getYieldConfiguration',
				args: [address as Address],
			},
			{
				address: ARB_INFO_ADDRESS,
				abi: NATIVE_YIELD_ABI,
				functionName: 'getBalanceValues',
				args: [address as Address],
			},
			{
				address: ARB_INFO_ADDRESS,
				abi: NATIVE_YIELD_ABI,
				functionName: 'getDelegate',
				args: [address as Address],
			},
		],
		query: {
			enabled: !!address,
			...MARKET_QUERY_CONFIG.USER_POSITIONS,
		},
	});

	const processedData = useMemo(() => {
		if (!contractResults || !address) return null;

		const [yieldConfigResult, balanceValuesResult, delegateResult] = contractResults;

		const yieldConfig = yieldConfigResult?.result ? Number(yieldConfigResult.result) : 2;
		const yieldMode = parseYieldMode(yieldConfig);

		const balanceValues = balanceValuesResult?.result
			? (balanceValuesResult.result as [bigint, bigint, bigint])
			: [0n, 0n, 0n];

		const delegate = delegateResult?.result ? (delegateResult.result as Address) : null;

		return {
			yieldMode,
			balanceValues: {
				fixed: balanceValues[0],
				shares: balanceValues[1],
				debt: balanceValues[2],
			},
			delegate,
		};
	}, [contractResults, address]);

	return {
		data: processedData,
		isLoading,
	};
}

export function useNativeYield() {
	const { data: apyData, isLoading: apyLoading } = useNativeYieldAPY();
	const { data: userData, isLoading: userLoading } = useUserNativeYield();

	const processedData = useMemo(() => {
		if (!apyData) return null;

		const baseData = {
			apy: apyData.apy,
			sharePrice: apyData.sharePrice,
			shareCount: apyData.shareCount,
		};

		if (!userData) {
			const result = {
				...baseData,
				yieldMode: 'void' as YieldMode,
				balanceValues: {
					fixed: 0n,
					shares: 0n,
					debt: 0n,
				},
				delegate: null,
			};

			return result;
		}

		return {
			...baseData,
			yieldMode: userData.yieldMode,
			balanceValues: userData.balanceValues,
			delegate: userData.delegate,
		};
	}, [apyData, userData]);

	return {
		data: processedData,
		isLoading: apyLoading || userLoading,
	};
}

export function useNativeYieldComparison(lendingAPY: string) {
	const { data: nativeYieldData } = useNativeYield();

	const comparison = useMemo(() => {
		if (!nativeYieldData) return null;

		return NativeYieldService.compareYields(nativeYieldData.apy, lendingAPY);
	}, [nativeYieldData, lendingAPY]);

	return comparison;
}

export function useEstimatedYield(balance: bigint) {
	const { data: nativeYieldData } = useNativeYield();

	const estimatedYield = useMemo(() => {
		if (!nativeYieldData || !balance) return null;

		const dailyYield = NativeYieldService.calculateDailyYield(nativeYieldData.apy, balance);
		const monthlyYield = dailyYield * 30n;

		return {
			daily: dailyYield,
			monthly: monthlyYield,
			dailyFormatted: NativeYieldService.formatYieldAmount(dailyYield),
			monthlyFormatted: NativeYieldService.formatYieldAmount(monthlyYield),
		};
	}, [nativeYieldData, balance]);

	return estimatedYield;
}
