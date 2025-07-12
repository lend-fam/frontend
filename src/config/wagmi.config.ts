import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Define ApeChain Mainnet
const apeChain = defineChain({
	id: 33139,
	name: 'ApeChain',
	nativeCurrency: {
		decimals: 18,
		name: 'ApeCoin',
		symbol: 'APE',
	},
	rpcUrls: {
		default: {
			http: ['https://apechain.calderachain.xyz/http'],
		},
	},
	blockExplorers: {
		default: {
			name: 'ApeScan',
			url: 'https://apescan.io',
		},
	},
});

// Define ApeChain Testnet
const apeChainTestnet = defineChain({
	id: 33111,
	name: 'ApeChain Testnet',
	nativeCurrency: {
		decimals: 18,
		name: 'ApeCoin',
		symbol: 'APE',
	},
	rpcUrls: {
		default: {
			http: ['https://apechain-testnet.calderachain.xyz/http'],
		},
	},
	blockExplorers: {
		default: {
			name: 'ApeScan Testnet',
			url: 'https://testnet.apescan.io',
		},
	},
	testnet: true,
});

export const wagmiConfig = getDefaultConfig({
	appName: 'lend.fam',
	projectId: 'YOUR_PROJECT_ID', // Get this from WalletConnect Cloud
	chains: [apeChain, apeChainTestnet],
	ssr: false, // Since this is a SPA
});