import { useReadContract, useAccount, useChainId } from 'wagmi';
import type { Address } from 'viem';
import { useMemo } from 'react';
import { LENS_ABI, getLensAddress } from '../contracts';

export interface CTokenBalancesLens {
	cToken: Address;
	balanceOf: bigint;
	borrowBalanceCurrent: bigint;
	balanceOfUnderlying: bigint;
	tokenBalance: bigint;
	tokenAllowance: bigint;
}

export interface CTokenBalanceData {
	cTokenBalance: bigint;
	underlyingBalance: bigint;
	borrowBalance: bigint;
	tokenBalance: bigint;
	tokenAllowance: bigint;
}

/**
 * Optimized hook using Lens contract to fetch all cToken balances in a single call
 * Replaces the original useCTokenBalances hook which made 4 calls per market
 */
export function useCTokenBalancesOptimized(marketAddresses: Address[]) {
	const chainId = useChainId();
	const { address: userAddress } = useAccount();

	const { data: lensResult, isLoading } = useReadContract({
		address: getLensAddress(chainId),
		abi: LENS_ABI,
		functionName: 'cTokenBalancesAll',
		args: userAddress && marketAddresses.length > 0 ? [marketAddresses, userAddress] : undefined,
		query: {
			enabled: !!userAddress && marketAddresses.length > 0,
		},
	});

	const cTokenBalances = useMemo(() => {
		const balances: Record<Address, CTokenBalanceData> = {};

		if (lensResult && marketAddresses.length > 0) {
			(lensResult as CTokenBalancesLens[]).forEach((balance) => {
				balances[balance.cToken] = {
					cTokenBalance: balance.balanceOf,
					underlyingBalance: balance.balanceOfUnderlying,
					borrowBalance: balance.borrowBalanceCurrent,
					tokenBalance: balance.tokenBalance,
					tokenAllowance: balance.tokenAllowance,
				};
			});
		}

		return balances;
	}, [lensResult, marketAddresses]);

	return {
		data: cTokenBalances,
		isLoading,
	};
}

/**
 * Optimized single market balance hook
 */
export function useCTokenBalanceOptimized(marketAddress: Address) {
	const { data, isLoading } = useCTokenBalancesOptimized([marketAddress]);
	return {
		data: data[marketAddress],
		isLoading,
	};
}

/**
 * Optimized hook for cToken balances only (no underlying/borrow data)
 */
export function useCTokenBalancesOnlyOptimized(marketAddresses: Address[]) {
	const { data, isLoading } = useCTokenBalancesOptimized(marketAddresses);

	const cTokenBalances = useMemo(() => {
		const balances: Record<Address, bigint> = {};

		Object.entries(data).forEach(([address, balance]) => {
			balances[address as Address] = balance.cTokenBalance;
		});

		return balances;
	}, [data]);

	return {
		data: cTokenBalances,
		isLoading,
	};
}
