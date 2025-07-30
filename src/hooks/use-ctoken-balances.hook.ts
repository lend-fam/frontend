import { useReadContracts, useAccount } from 'wagmi';
import type { Address } from 'viem';
import { useMemo } from 'react';
import { CTOKEN_ABI } from '../contracts/ctoken.abi';
import { MARKET_QUERY_CONFIG } from './market-query.constants';

export interface CTokenBalanceData {
	cTokenBalance: bigint;
	underlyingBalance: bigint;
	borrowBalance: bigint;
	exchangeRate: bigint;
}

export function useCTokenBalances(marketAddresses: Address[]) {
	const { address: userAddress } = useAccount();

	const contracts = useMemo(() => {
		if (!userAddress || marketAddresses.length === 0) return [];

		const contractCalls: Array<{
			address: Address;
			abi: typeof CTOKEN_ABI;
			functionName: 'balanceOf' | 'balanceOfUnderlying' | 'borrowBalanceStored' | 'exchangeRateStored';
			args?: readonly [Address];
		}> = [];

		marketAddresses.forEach((marketAddress) => {
			contractCalls.push(
				{
					address: marketAddress,
					abi: CTOKEN_ABI,
					functionName: 'balanceOf' as const,
					args: [userAddress] as const,
				},
				{
					address: marketAddress,
					abi: CTOKEN_ABI,
					functionName: 'balanceOfUnderlying' as const,
					args: [userAddress] as const,
				},
				{
					address: marketAddress,
					abi: CTOKEN_ABI,
					functionName: 'borrowBalanceStored' as const,
					args: [userAddress] as const,
				},
				{
					address: marketAddress,
					abi: CTOKEN_ABI,
					functionName: 'exchangeRateStored' as const,
				},
			);
		});

		return contractCalls;
	}, [userAddress, marketAddresses]);

	const { data: contractData, isLoading } = useReadContracts({
		contracts,
		query: {
			enabled: !!userAddress && marketAddresses.length > 0,
			...MARKET_QUERY_CONFIG.USER_POSITIONS,
		},
	});

	const cTokenBalances = useMemo(() => {
		const balances: Record<Address, CTokenBalanceData> = {};

		if (contractData && marketAddresses.length > 0) {
			marketAddresses.forEach((marketAddress, index) => {
				const baseIndex = index * 4;

				const cTokenBalanceResult = contractData[baseIndex];
				const underlyingBalanceResult = contractData[baseIndex + 1];
				const borrowBalanceResult = contractData[baseIndex + 2];
				const exchangeRateResult = contractData[baseIndex + 3];

				balances[marketAddress] = {
					cTokenBalance:
						cTokenBalanceResult?.status === 'success' ? (cTokenBalanceResult.result as bigint) : 0n,
					underlyingBalance:
						underlyingBalanceResult?.status === 'success' ? (underlyingBalanceResult.result as bigint) : 0n,
					borrowBalance:
						borrowBalanceResult?.status === 'success' ? (borrowBalanceResult.result as bigint) : 0n,
					exchangeRate: exchangeRateResult?.status === 'success' ? (exchangeRateResult.result as bigint) : 0n,
				};
			});
		}

		return balances;
	}, [contractData, marketAddresses]);

	return {
		data: cTokenBalances,
		isLoading,
	};
}

export function useCTokenBalance(marketAddress: Address) {
	const { data, isLoading } = useCTokenBalances([marketAddress]);
	return {
		data: data[marketAddress],
		isLoading,
	};
}

export function useCTokenBalancesOnly(marketAddresses: Address[]) {
	const { address: userAddress } = useAccount();

	const contracts = marketAddresses.map((marketAddress) => ({
		address: marketAddress,
		abi: CTOKEN_ABI,
		functionName: 'balanceOf' as const,
		args: [userAddress!] as const,
	}));

	const { data: balanceData, isLoading } = useReadContracts({
		contracts,
		query: {
			enabled: !!userAddress && marketAddresses.length > 0,
			...MARKET_QUERY_CONFIG.WALLET_BALANCES,
		},
	});

	const cTokenBalances = useMemo(() => {
		const balances: Record<Address, bigint> = {};

		if (balanceData) {
			marketAddresses.forEach((marketAddress, index) => {
				const result = balanceData[index];
				balances[marketAddress] = result?.status === 'success' ? (result.result as bigint) : 0n;
			});
		}

		return balances;
	}, [balanceData, marketAddresses]);

	return {
		data: cTokenBalances,
		isLoading,
	};
}
