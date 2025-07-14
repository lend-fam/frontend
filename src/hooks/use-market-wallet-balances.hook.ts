import { useReadContracts, useAccount, useBalance } from 'wagmi';
import type { Address } from 'viem';
import { useMemo } from 'react';
import { isAddressEqual, zeroAddress } from 'viem';

const CTOKEN_ABI = [
	{
		inputs: [],
		name: 'underlying',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function',
	},
] as const;

export function useMarketWalletBalances(marketAddresses: Address[]) {
	const { address: userAddress } = useAccount();

	const contracts = marketAddresses.map((address) => ({
		address,
		abi: CTOKEN_ABI,
		functionName: 'underlying' as const,
	}));

	const { data: underlyingData, isLoading: underlyingLoading } = useReadContracts({
		contracts,
		query: {
			enabled: marketAddresses.length > 0,
		},
	});
	const underlyingTokens = useMemo(() => {
		const tokens: Record<Address, Address | 'native'> = {};
		const nativeTokenMarkets: Address[] = [];

		if (underlyingData) {
			marketAddresses.forEach((marketAddress, index) => {
				const result = underlyingData[index];
				if (
					result.status === 'success' &&
					result.result &&
					!isAddressEqual(result.result as Address, zeroAddress)
				) {
					tokens[marketAddress] = result.result as Address;
				} else {
					tokens[marketAddress] = 'native';
					nativeTokenMarkets.push(marketAddress);
				}
			});
		}
		return { tokens, nativeTokenMarkets };
	}, [underlyingData, marketAddresses]);

	const uniqueUnderlyingTokens = useMemo(() => {
		return [...new Set(Object.values(underlyingTokens.tokens).filter((token) => token !== 'native'))];
	}, [underlyingTokens]);
	const balanceContracts = uniqueUnderlyingTokens.map((token) => ({
		address: token as Address,
		abi: [
			{
				inputs: [{ name: 'account', type: 'address' }],
				name: 'balanceOf',
				outputs: [{ name: '', type: 'uint256' }],
				stateMutability: 'view',
				type: 'function',
			},
		] as const,
		functionName: 'balanceOf' as const,
		args: [userAddress!] as const,
	}));

	const { data: balanceData, isLoading: balanceLoading } = useReadContracts({
		contracts: balanceContracts,
		query: {
			enabled: !!userAddress && uniqueUnderlyingTokens.length > 0,
		},
	});

	const { data: nativeBalance, isLoading: nativeBalanceLoading } = useBalance({
		address: userAddress,
		query: {
			enabled: !!userAddress && underlyingTokens.nativeTokenMarkets.length > 0,
			staleTime: 5000,
			refetchOnWindowFocus: true,
			refetchOnMount: true,
		},
	});

	const marketBalances = useMemo(() => {
		const balances: Record<Address, bigint> = {};

		if (underlyingTokens.tokens) {
			Object.entries(underlyingTokens.tokens).forEach(([marketAddress, underlyingToken]) => {
				if (underlyingToken === 'native') {
					balances[marketAddress as Address] = nativeBalance?.value || 0n;
				} else {
					const tokenIndex = uniqueUnderlyingTokens.indexOf(underlyingToken as Address);
					if (tokenIndex !== -1 && balanceData && balanceData[tokenIndex]?.status === 'success') {
						balances[marketAddress as Address] = balanceData[tokenIndex].result as bigint;
					} else {
						balances[marketAddress as Address] = 0n;
					}
				}
			});
		}

		return balances;
	}, [balanceData, underlyingTokens, uniqueUnderlyingTokens, nativeBalance]);

	return {
		data: marketBalances,
		underlyingTokens: underlyingTokens.tokens,
		nativeTokenMarkets: underlyingTokens.nativeTokenMarkets,
		isLoading: underlyingLoading || balanceLoading || nativeBalanceLoading,
	};
}
