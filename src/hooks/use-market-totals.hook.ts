import { useMemo } from 'react';
import type { Address } from 'viem';
import { useReadContracts } from 'wagmi';
import { CTOKEN_ABI } from '../contracts/ctoken.abi';
import { useAllMarkets } from './use-market-core.hook';

export type MarketTotals = {
	[marketAddress: Address]: {
		totalSupply: bigint;
		totalBorrows: bigint;
		exchangeRate: bigint;
		getCash: bigint;
	};
};

export const useMarketTotals = () => {
	const { data: allMarkets, isLoading: marketsLoading } = useAllMarkets();

	const contracts = useMemo(() => {
		if (!allMarkets) return [];

		const contractCalls = [];

		for (const marketAddress of allMarkets) {
			contractCalls.push(
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
				{
					address: marketAddress,
					abi: CTOKEN_ABI,
					functionName: 'getCash',
				},
			);
		}

		return contractCalls;
	}, [allMarkets]);

	const { data: contractResults, isLoading: dataLoading } = useReadContracts({
		contracts,
		query: {
			enabled: !!allMarkets && allMarkets.length > 0,
			staleTime: 30000,
		},
	});

	const data = useMemo(() => {
		if (!allMarkets || !contractResults || marketsLoading || dataLoading) {
			return undefined;
		}

		const totals: MarketTotals = {};

		for (let i = 0; i < allMarkets.length; i++) {
			const marketAddress = allMarkets[i];
			const baseIndex = i * 4;

			const totalSupplyResult = contractResults[baseIndex];
			const totalBorrowsResult = contractResults[baseIndex + 1];
			const exchangeRateResult = contractResults[baseIndex + 2];
			const getCashResult = contractResults[baseIndex + 3];

			totals[marketAddress] = {
				totalSupply: (totalSupplyResult?.result as bigint) || 0n,
				totalBorrows: (totalBorrowsResult?.result as bigint) || 0n,
				exchangeRate: (exchangeRateResult?.result as bigint) || 0n,
				getCash: (getCashResult?.result as bigint) || 0n,
			};
		}

		return totals;
	}, [allMarkets, contractResults, marketsLoading, dataLoading]);

	return {
		data,
		isLoading: marketsLoading || dataLoading,
	};
};
