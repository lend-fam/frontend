import type { Address } from 'viem';
import { parseUnits } from 'viem';

// Test contract addresses for ApeChain Testnet (Chain ID 33111)
// Deployed contracts from testnet/deployments/33111_1753102362.json
export const TESTNET_CONTRACTS = {
	TEST_USDC: '0xb5F0706258e72D68D46044a6A5A609762C18668A' as Address, // mUSDC
	TEST_WETH: '0x36d313902A693fdE78af5c38ceC8D3e5aB5E06e1' as Address, // mWETH
	TEST_USDT: '0xac7AEBbb0C4DF539Caf971BEfADD8A9561E453dE' as Address, // mUSDT
	TEST_APEUSD: '0xAfBd84951F7b6c9734eFc82Da391A857c71c1380' as Address, // mapeUSD
	TEST_BAYC: '0xa16b8F57B9e0d535D9e89e11824800e6330Af740' as Address, // mBAYC
	TEST_PUNK: '0x18565F8d82018435ed3e98e0fA3BcF52084c7240' as Address, // mPUNK
} as const;

export const FAUCET_AMOUNTS = {
	USDC: parseUnits('1000', 6), // 1000 USDC (fixed amount from faucet)
	WETH: parseUnits('10', 18), // 10 WETH (fixed amount from faucet)
	USDT: parseUnits('1000', 6), // 1000 USDT (fixed amount from faucet)
	APEUSD: parseUnits('1000', 18), // 1000 apeUSD (fixed amount from faucet)
} as const;

export const TOKEN_DECIMALS = {
	USDC: 6,
	WETH: 18,
	USDT: 6,
	APEUSD: 18,
} as const;

export class FaucetService {
	static getTokenAmount(tokenType: string): bigint {
		switch (tokenType.toLowerCase()) {
			case 'usdc':
				return FAUCET_AMOUNTS.USDC;
			case 'weth':
				return FAUCET_AMOUNTS.WETH;
			case 'usdt':
				return FAUCET_AMOUNTS.USDT;
			case 'apeusd':
				return FAUCET_AMOUNTS.APEUSD;
			default:
				return 0n;
		}
	}

	static getTokenAddress(tokenType: string): Address | undefined {
		switch (tokenType.toLowerCase()) {
			case 'usdc':
				return TESTNET_CONTRACTS.TEST_USDC;
			case 'weth':
				return TESTNET_CONTRACTS.TEST_WETH;
			case 'usdt':
				return TESTNET_CONTRACTS.TEST_USDT;
			case 'apeusd':
				return TESTNET_CONTRACTS.TEST_APEUSD;
			default:
				return undefined;
		}
	}

	static getNftAddress(nftType?: string): Address | undefined {
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
			case 'usdt':
				return TOKEN_DECIMALS.USDT;
			case 'apeusd':
				return TOKEN_DECIMALS.APEUSD;
			default:
				return 18;
		}
	}
}
