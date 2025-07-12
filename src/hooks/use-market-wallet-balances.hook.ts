import { useReadContracts, useBalance, useAccount } from 'wagmi';
import type { Address } from 'viem';
import { useMemo } from 'react';

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

	// First, fetch all underlying token addresses
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

	// Extract underlying tokens from the results
	const underlyingTokens = useMemo(() => {
		const tokens: Record<Address, Address> = {};
		if (underlyingData) {
			marketAddresses.forEach((marketAddress, index) => {
				const result = underlyingData[index];
				if (result.status === 'success' && result.result) {
					tokens[marketAddress] = result.result as Address;
				}
			});
		}
		return tokens;
	}, [underlyingData, marketAddresses]);

	// Create an array of underlying token addresses for balance queries
	const uniqueUnderlyingTokens = useMemo(() => {
		return [...new Set(Object.values(underlyingTokens))];
	}, [underlyingTokens]);

	// Fetch balances for all unique underlying tokens
	const balanceContracts = uniqueUnderlyingTokens.map((token) => ({
		address: userAddress!,
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
		// Use the token as the contract address
		address: token,
	}));

	const { data: balanceData, isLoading: balanceLoading } = useReadContracts({
		contracts: balanceContracts,
		query: {
			enabled: !!userAddress && uniqueUnderlyingTokens.length > 0,
		},
	});

	// Map balances back to market addresses
	const marketBalances = useMemo(() => {
		const balances: Record<Address, bigint> = {};
		
		if (balanceData && underlyingTokens) {
			Object.entries(underlyingTokens).forEach(([marketAddress, underlyingToken]) => {
				const tokenIndex = uniqueUnderlyingTokens.indexOf(underlyingToken);
				if (tokenIndex !== -1 && balanceData[tokenIndex]?.status === 'success') {
					balances[marketAddress as Address] = balanceData[tokenIndex].result as bigint;
				} else {
					balances[marketAddress as Address] = 0n;
				}
			});
		}

		return balances;
	}, [balanceData, underlyingTokens, uniqueUnderlyingTokens]);

	return {
		data: marketBalances,
		underlyingTokens,
		isLoading: underlyingLoading || balanceLoading,
	};
}