import type { Address } from 'viem';
import { parseUnits } from 'viem';

// Test contract addresses for ApeChain Testnet (Chain ID 33111)
// Deployed contracts from testnet/deployments/33111_1753023826.json
export const TESTNET_CONTRACTS = {
	TEST_USDC: '0x0d52D596990C09397132460F2CEF90178fc1435C' as Address, // mUSDC
	TEST_WETH: '0x424535A9393EaAbbf9222C479ce5F2f59173F630' as Address, // mWETH
	TEST_DAI: '0x8F30ff95dA229462202EFa25C07643f8c06eBEb2' as Address, // mDAI
	TEST_BAYC: '0x12f45b9aF795f928e856Fc8a772b86cc82d065f2' as Address, // mBAYC
	TEST_PUNK: '0x4819049ED9B22B4dc5Ce14Ee065A88122f6FEC86' as Address, // mPUNK
} as const;

export const FAUCET_AMOUNTS = {
	USDC: parseUnits('100', 6), // 100 USDC (fixed amount from faucet)
	WETH: parseUnits('100', 18), // 100 WETH (fixed amount from faucet)
	DAI: parseUnits('100', 18), // 100 DAI (fixed amount from faucet)
} as const;

export const TOKEN_DECIMALS = {
	USDC: 6,
	WETH: 18,
	DAI: 18,
} as const;

export class FaucetService {
	static getTokenAmount(tokenType: string): bigint {
		switch (tokenType.toLowerCase()) {
			case 'usdc':
				return FAUCET_AMOUNTS.USDC;
			case 'weth':
				return FAUCET_AMOUNTS.WETH;
			case 'dai':
				return FAUCET_AMOUNTS.DAI;
			default:
				return 0n;
		}
	}

	static getTokenAddress(tokenType: string): Address | null {
		switch (tokenType.toLowerCase()) {
			case 'usdc':
				return TESTNET_CONTRACTS.TEST_USDC;
			case 'weth':
				return TESTNET_CONTRACTS.TEST_WETH;
			case 'dai':
				return TESTNET_CONTRACTS.TEST_DAI;
			default:
				return null;
		}
	}

	static getNftAddress(nftType?: string): Address | null {
		switch (nftType?.toLowerCase()) {
			case 'bayc':
			case 'bored_ape':
				return TESTNET_CONTRACTS.TEST_BAYC;
			case 'punk':
			case 'cryptopunk':
				return TESTNET_CONTRACTS.TEST_PUNK;
			default:
				return TESTNET_CONTRACTS.TEST_BAYC; // Default to BAYC for backwards compatibility
		}
	}

	static getTokenDecimals(tokenType: string): number {
		switch (tokenType.toLowerCase()) {
			case 'usdc':
				return TOKEN_DECIMALS.USDC;
			case 'weth':
				return TOKEN_DECIMALS.WETH;
			case 'dai':
				return TOKEN_DECIMALS.DAI;
			default:
				return 18;
		}
	}
}
