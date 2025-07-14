import { useReadContracts } from 'wagmi';
import type { Address } from 'viem';
import { CTOKEN_ABI } from '../contracts/ctoken.abi';
import { ERC20_ABI } from '../contracts/erc20.abi';

export interface TokenMetadata {
	name: string;
	symbol: string;
	underlyingAddress?: Address;
	underlyingName?: string;
	underlyingSymbol?: string;
	underlyingDecimals?: number;
}

export function useTokenMetadata(marketAddresses: Address[]) {
	// Get cToken metadata (name, symbol, underlying address)
	const ctokenContracts = marketAddresses.flatMap((address) => [
		{
			address,
			abi: CTOKEN_ABI,
			functionName: 'name' as const,
		},
		{
			address,
			abi: CTOKEN_ABI,
			functionName: 'symbol' as const,
		},
		{
			address,
			abi: CTOKEN_ABI,
			functionName: 'underlying' as const,
		},
	]);

	const {
		data: ctokenData,
		isLoading: ctokenLoading,
		error: ctokenError,
	} = useReadContracts({
		contracts: ctokenContracts,
		query: {
			enabled: marketAddresses.length > 0,
		},
	});

	// Extract underlying token addresses from cToken data
	const underlyingAddresses: Address[] = [];
	if (ctokenData) {
		for (let i = 0; i < marketAddresses.length; i++) {
			const underlyingResult = ctokenData[i * 3 + 2]; // underlying is every 3rd result
			if (underlyingResult.status === 'success' && underlyingResult.result) {
				underlyingAddresses.push(underlyingResult.result as Address);
			}
		}
	}

	// Get underlying token metadata (name, symbol, decimals)
	const underlyingContracts = underlyingAddresses.flatMap((address) => [
		{
			address,
			abi: ERC20_ABI,
			functionName: 'name' as const,
		},
		{
			address,
			abi: ERC20_ABI,
			functionName: 'symbol' as const,
		},
		{
			address,
			abi: ERC20_ABI,
			functionName: 'decimals' as const,
		},
	]);

	const {
		data: underlyingData,
		isLoading: underlyingLoading,
		error: underlyingError,
	} = useReadContracts({
		contracts: underlyingContracts,
		query: {
			enabled: underlyingAddresses.length > 0,
		},
	});

	// Combine all data into TokenMetadata objects
	const tokenMetadata: Record<Address, TokenMetadata> = {};

	if (ctokenData) {
		marketAddresses.forEach((marketAddress, index) => {
			const nameResult = ctokenData[index * 3];
			const symbolResult = ctokenData[index * 3 + 1];
			const underlyingResult = ctokenData[index * 3 + 2];

			const name = nameResult.status === 'success' ? (nameResult.result as string) : 'Unknown';
			const symbol = symbolResult.status === 'success' ? (symbolResult.result as string) : 'Unknown';
			const underlyingAddress =
				underlyingResult.status === 'success' ? (underlyingResult.result as Address) : undefined;

			let underlyingName: string | undefined;
			let underlyingSymbol: string | undefined;
			let underlyingDecimals: number | undefined;

			if (underlyingAddress && underlyingData) {
				const underlyingIndex = underlyingAddresses.indexOf(underlyingAddress);
				if (underlyingIndex !== -1) {
					const underlyingNameResult = underlyingData[underlyingIndex * 3];
					const underlyingSymbolResult = underlyingData[underlyingIndex * 3 + 1];
					const underlyingDecimalsResult = underlyingData[underlyingIndex * 3 + 2];

					underlyingName =
						underlyingNameResult.status === 'success' ? (underlyingNameResult.result as string) : undefined;
					underlyingSymbol =
						underlyingSymbolResult.status === 'success'
							? (underlyingSymbolResult.result as string)
							: undefined;
					underlyingDecimals =
						underlyingDecimalsResult.status === 'success'
							? Number(underlyingDecimalsResult.result)
							: undefined;
				}
			}

			tokenMetadata[marketAddress] = {
				name,
				symbol,
				underlyingAddress,
				underlyingName,
				underlyingSymbol,
				underlyingDecimals,
			};
		});
	}

	return {
		data: tokenMetadata,
		isLoading: ctokenLoading || underlyingLoading,
		error: ctokenError || underlyingError,
	};
}
