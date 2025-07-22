import type { Address } from 'viem';
import { parseUnits } from 'viem';

// Test contract addresses for ApeChain Testnet (Chain ID 33111)
// Deployed contracts from testnet/deployments/33111_1753102362.json
export const TESTNET_CONTRACTS = {
	TEST_USDC: '0x68F8a5dd18391792F1028C6580EA4835Cb2B6C80' as Address, // mUSDC
	TEST_WETH: '0x38Fd286a0c8746CCC231E770Dce5cd534daA9135' as Address, // mWETH
	TEST_USDT: '0x6B96bD8d2377489922DafC7251C55CCAB64502e7' as Address, // mUSDT
	TEST_APEUSD: '0xEDB400457bd465AD379cAad36735254dfFCE6dfe' as Address, // mapeUSD
	TEST_BAYC: '0xD654c94Bb39c16D7a5bd521194Ed3a5B66b6dfF2' as Address, // mBAYC
	TEST_PUNK: '0xc34a93AaF0D5b814B566D76C7eD27B13ddb76034' as Address, // mPUNK
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
