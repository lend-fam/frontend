import type { Address } from 'viem';

export function getComptrollerAddress(chainId?: number): Address {
	if (chainId === 33111) {
		return (import.meta.env.VITE_COMPTROLLER_ADDRESS_TESTNET || '0x7E81fAaF1132A17DCc0C76b1280E0C0e598D5635') as Address;
	}
	return (import.meta.env.VITE_COMPTROLLER_ADDRESS_MAINNET || '0x7E81fAaF1132A17DCc0C76b1280E0C0e598D5635') as Address;
}

export function getLensAddress(chainId?: number): Address {
	if (chainId === 33111) {
		return (import.meta.env.VITE_APECHAIN_CURTIS_COMPOUND_LENS_ADDRESS || '0x974726560D89E934CE0CDefac01eD6210da33fd0') as Address;
	}
	return (import.meta.env.VITE_APECHAIN_MAINNET_COMPOUND_LENS_ADDRESS || '0x974726560D89E934CE0CDefac01eD6210da33fd0') as Address;
}

export const CONTRACTS = {
	COMPTROLLER: getComptrollerAddress(),
	ARB_INFO: '0x0000000000000000000000000000000000000065' as const,
	ARB_OWNER_PUBLIC: '0x000000000000000000000000000000000000006b' as const,
} as const;

export const BLOCKS_PER_YEAR = 2102400;
