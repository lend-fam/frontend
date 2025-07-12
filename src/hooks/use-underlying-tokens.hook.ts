import { useReadContracts } from 'wagmi';
import type { Address } from 'viem';

const CTOKEN_ABI = [
	{
		inputs: [],
		name: 'underlying',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function',
	},
] as const;

export function useUnderlyingTokens(marketAddresses: Address[]) {
	const contracts = marketAddresses.map((address) => ({
		address,
		abi: CTOKEN_ABI,
		functionName: 'underlying' as const,
	}));

	const { data, isLoading, error } = useReadContracts({
		contracts,
		query: {
			enabled: marketAddresses.length > 0,
		},
	});

	const underlyingTokens: Record<Address, Address> = {};
	
	if (data) {
		marketAddresses.forEach((marketAddress, index) => {
			const result = data[index];
			if (result.status === 'success' && result.result) {
				underlyingTokens[marketAddress] = result.result as Address;
			}
		});
	}

	return {
		data: underlyingTokens,
		isLoading,
		error,
	};
}