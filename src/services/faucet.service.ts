import type { Address } from 'viem';
import { parseUnits } from 'viem';

// Test contract addresses for ApeChain Testnet
// These would need to be deployed test contracts
export const TESTNET_CONTRACTS = {
	// Placeholder addresses - replace with actual deployed test contracts
	TEST_APE: '0x1111111111111111111111111111111111111111' as Address,
	TEST_USDC: '0x2222222222222222222222222222222222222222' as Address,
	TEST_WETH: '0x3333333333333333333333333333333333333333' as Address,
	TEST_NFT: '0x4444444444444444444444444444444444444444' as Address,
} as const;

export const FAUCET_AMOUNTS = {
	APE: parseUnits('1000', 18), // 1000 APE
	USDC: parseUnits('10000', 6), // 10000 USDC
	WETH: parseUnits('10', 18), // 10 WETH
} as const;

export const TOKEN_DECIMALS = {
	APE: 18,
	USDC: 6,
	WETH: 18,
} as const;

export class FaucetService {
	static getTokenAmount(tokenType: string): bigint {
		switch (tokenType.toLowerCase()) {
			case 'ape':
				return FAUCET_AMOUNTS.APE;
			case 'usdc':
				return FAUCET_AMOUNTS.USDC;
			case 'weth':
				return FAUCET_AMOUNTS.WETH;
			default:
				return 0n;
		}
	}

	static getTokenAddress(tokenType: string): Address | null {
		switch (tokenType.toLowerCase()) {
			case 'ape':
				return TESTNET_CONTRACTS.TEST_APE;
			case 'usdc':
				return TESTNET_CONTRACTS.TEST_USDC;
			case 'weth':
				return TESTNET_CONTRACTS.TEST_WETH;
			default:
				return null;
		}
	}

	static getNftAddress(): Address {
		return TESTNET_CONTRACTS.TEST_NFT;
	}

	static getTokenDecimals(tokenType: string): number {
		switch (tokenType.toLowerCase()) {
			case 'ape':
				return TOKEN_DECIMALS.APE;
			case 'usdc':
				return TOKEN_DECIMALS.USDC;
			case 'weth':
				return TOKEN_DECIMALS.WETH;
			default:
				return 18;
		}
	}
}
