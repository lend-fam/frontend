import { useReadContracts } from 'wagmi';
import { useMemo } from 'react';
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
	const contracts = useMemo(() => {
		if (marketAddresses.length === 0) return [];

		const allContracts: Array<{
			address: Address;
			abi: typeof CTOKEN_ABI;
			functionName: 'name' | 'symbol' | 'underlying';
		}> = [];

		marketAddresses.forEach((address) => {
			allContracts.push(
				{ address, abi: CTOKEN_ABI, functionName: 'name' as const },
				{ address, abi: CTOKEN_ABI, functionName: 'symbol' as const },
				{ address, abi: CTOKEN_ABI, functionName: 'underlying' as const },
			);
		});

		return allContracts;
	}, [marketAddresses]);

	const {
		data: ctokenData,
		isLoading: ctokenLoading,
		error: ctokenError,
	} = useReadContracts({
		contracts,
		query: {
			enabled: contracts.length > 0,
		},
	});

	const underlyingContracts = useMemo(() => {
		if (!ctokenData) return [];

		const underlyingAddresses: Address[] = [];
		const addressMap = new Map<Address, number>();

		for (let i = 0; i < marketAddresses.length; i++) {
			const underlyingResult = ctokenData[i * 3 + 2];
			if (underlyingResult.status === 'success' && underlyingResult.result) {
				const address = underlyingResult.result as Address;
				if (!addressMap.has(address)) {
					addressMap.set(address, underlyingAddresses.length);
					underlyingAddresses.push(address);
				}
			}
		}

		return underlyingAddresses.flatMap((address) => [
			{ address, abi: ERC20_ABI, functionName: 'name' as const },
			{ address, abi: ERC20_ABI, functionName: 'symbol' as const },
			{ address, abi: ERC20_ABI, functionName: 'decimals' as const },
		]);
	}, [ctokenData, marketAddresses]);

	const {
		data: underlyingData,
		isLoading: underlyingLoading,
		error: underlyingError,
	} = useReadContracts({
		contracts: underlyingContracts,
		query: {
			enabled: underlyingContracts.length > 0,
		},
	});

	const tokenMetadata = useMemo(() => {
		if (!ctokenData) return {};

		const result: Record<Address, TokenMetadata> = {};

		const underlyingAddressMap = new Map<Address, number>();
		let underlyingIndex = 0;

		for (let i = 0; i < marketAddresses.length; i++) {
			const underlyingResult = ctokenData[i * 3 + 2];
			if (underlyingResult.status === 'success' && underlyingResult.result) {
				const address = underlyingResult.result as Address;
				if (!underlyingAddressMap.has(address)) {
					underlyingAddressMap.set(address, underlyingIndex);
					underlyingIndex++;
				}
			}
		}

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
				const dataIndex = underlyingAddressMap.get(underlyingAddress);
				if (dataIndex !== undefined) {
					const underlyingNameResult = underlyingData[dataIndex * 3];
					const underlyingSymbolResult = underlyingData[dataIndex * 3 + 1];
					const underlyingDecimalsResult = underlyingData[dataIndex * 3 + 2];

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

			result[marketAddress] = {
				name,
				symbol,
				underlyingAddress,
				underlyingName,
				underlyingSymbol,
				underlyingDecimals,
			};
		});

		return result;
	}, [ctokenData, underlyingData, marketAddresses]);

	return {
		data: tokenMetadata,
		isLoading: ctokenLoading || underlyingLoading,
		error: ctokenError || underlyingError,
	};
}
