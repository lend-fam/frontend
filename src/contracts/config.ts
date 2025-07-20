import type { Address } from 'viem';

export function getComptrollerAddress(chainId?: number): Address {
	if (chainId === 33111) {
		return import.meta.env.VITE_COMPTROLLER_ADDRESS_TESTNET as Address;
	}
	return import.meta.env.VITE_COMPTROLLER_ADDRESS_MAINNET as Address;
}

export function getLensAddress(chainId?: number): Address {
	if (chainId === 33111) {
		return import.meta.env.VITE_APECHAIN_CURTIS_COMPOUND_LENS_ADDRESS as Address;
	}
	return import.meta.env.VITE_APECHAIN_MAINNET_COMPOUND_LENS_ADDRESS as Address;
}

export const CONTRACTS = {
	COMPTROLLER: getComptrollerAddress(),
	ARB_INFO: '0x0000000000000000000000000000000000000065' as const,
	ARB_OWNER_PUBLIC: '0x000000000000000000000000000000000000006b' as const,
} as const;

export const BLOCKS_PER_YEAR = 2102400;
