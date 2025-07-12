import type { Address } from 'viem';

/**
 * Get the Comptroller address for the current network
 * Defaults to mainnet if no chain ID is provided
 */
export function getComptrollerAddress(chainId?: number): Address {
  // ApeChain Testnet
  if (chainId === 33111) {
    return import.meta.env.VITE_COMPTROLLER_ADDRESS_TESTNET as Address;
  }
  
  // ApeChain Mainnet (default)
  return import.meta.env.VITE_COMPTROLLER_ADDRESS_MAINNET as Address;
}

export const CONTRACTS = {
  COMPTROLLER: getComptrollerAddress(),
} as const;

export const BLOCKS_PER_YEAR = 2102400; // Approximate blocks per year (assuming 15 second blocks)