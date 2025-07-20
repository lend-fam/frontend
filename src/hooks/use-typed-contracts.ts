import { type Address } from 'viem';
import { useReadContracts, type UseReadContractsParameters, type UseReadContractsReturnType } from 'wagmi';

/**
 * Type-safe result extraction from useReadContracts
 */
export type TypedContractResult<T = unknown> = {
	status: 'success' | 'failure';
	result?: T;
	error?: Error;
};

/**
 * Helper to safely extract typed results from contract calls
 */
export function extractTypedResult<T>(
	contractResult: TypedContractResult | undefined,
	validator?: (value: unknown) => value is T,
): T | undefined {
	if (contractResult?.status === 'success' && contractResult.result !== undefined) {
		const result = contractResult.result;
		if (validator) {
			return validator(result) ? result : undefined;
		}
		return result as T;
	}
	return undefined;
}

/**
 * Type guard for Address validation
 */
export function isAddress(value: unknown): value is Address {
	return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value);
}

/**
 * Type guard for bigint validation
 */
export function isBigInt(value: unknown): value is bigint {
	return typeof value === 'bigint';
}

/**
 * Type guard for string validation
 */
export function isString(value: unknown): value is string {
	return typeof value === 'string';
}

/**
 * Type-safe wrapper for useReadContracts with result extraction utilities
 */
export function useTypedReadContracts<TContracts extends readonly unknown[] = readonly unknown[]>(
	parameters: UseReadContractsParameters<TContracts>,
): UseReadContractsReturnType<TContracts> & {
	extractAddress: (index: number) => Address | undefined;
	extractBigInt: (index: number) => bigint | undefined;
	extractString: (index: number) => string | undefined;
	extractTyped: <T>(index: number, validator?: (value: unknown) => value is T) => T | undefined;
} {
	const result = useReadContracts(parameters);

	return {
		...result,
		extractAddress: (index: number) => extractTypedResult(result.data?.[index] as TypedContractResult, isAddress),
		extractBigInt: (index: number) => extractTypedResult(result.data?.[index] as TypedContractResult, isBigInt),
		extractString: (index: number) => extractTypedResult(result.data?.[index] as TypedContractResult, isString),
		extractTyped: <T>(index: number, validator?: (value: unknown) => value is T) =>
			extractTypedResult<T>(result.data?.[index] as TypedContractResult, validator),
	};
}

/**
 * Hook for type-safe oracle address extraction
 */
export function useTypedOracleAddress(chainId: number) {
	const { extractAddress, ...rest } = useTypedReadContracts({
		contracts: [
			{
				address: getComptrollerAddress(chainId),
				abi: COMPTROLLER_ABI,
				functionName: 'oracle',
			},
		] as const,
		query: {
			staleTime: 5 * 60 * 1000,
		},
	});

	return {
		...rest,
		data: extractAddress(0),
		isOracleAddress: (value: unknown): value is Address => isAddress(value),
	};
}

// Re-export contract imports for convenience
import { COMPTROLLER_ABI, getComptrollerAddress } from '../contracts';
