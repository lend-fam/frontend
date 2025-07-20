import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { createConfig } from 'wagmi';
import { defineChain, http, Transport } from 'viem';
import {
	rainbowWallet,
	coinbaseWallet,
	metaMaskWallet,
	// walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { glyphWalletRK, glyphConnectorDetails } from '@use-glyph/sdk-react';

export const apeChainMainnet = defineChain({
	id: 33139,
	name: 'ApeChain',
	nativeCurrency: {
		decimals: 18,
		name: 'ApeCoin',
		symbol: 'APE',
	},
	rpcUrls: {
		default: {
			http: [
				import.meta.env.VITE_APECHAIN_CURTIS_RPC_HTTP || 'https://curtis.rpc.caldera.xyz/http',
				import.meta.env.VITE_APECHAIN_MAINNET_RPC_HTTP || 'https://rpc.apechain.com/http',
			],
			webSocket: [
				import.meta.env.VITE_APECHAIN_CURTIS_RPC_WS || 'wss://curtis.rpc.caldera.xyz/ws',
				import.meta.env.VITE_APECHAIN_MAINNET_RPC_WS || 'wss://rpc.apechain.com/ws',
			],
		},
	},
	blockExplorers: {
		default: {
			name: 'ApeScan',
			url: import.meta.env.VITE_APECHAIN_MAINNET_BLOCK_EXPLORER || 'https://apescan.io',
		},
	},
});

export const apeChainTestnet = defineChain({
	id: 33111,
	name: 'ApeChain Testnet',
	nativeCurrency: {
		decimals: 18,
		name: 'ApeCoin',
		symbol: 'APE',
	},
	rpcUrls: {
		default: {
			http: [import.meta.env.VITE_APECHAIN_CURTIS_RPC_HTTP || 'https://curtis.rpc.caldera.xyz/http'],
			webSocket: [import.meta.env.VITE_APECHAIN_CURTIS_RPC_WS || 'wss://curtis.rpc.caldera.xyz/ws'],
		},
	},
	blockExplorers: {
		default: {
			name: 'ApeScan Testnet',
			url: import.meta.env.VITE_APECHAIN_CURTIS_BLOCK_EXPLORER || 'https://curtis.apescan.io',
		},
	},
	testnet: true,
});

const supportedChains: [typeof apeChainMainnet, typeof apeChainTestnet] = [apeChainMainnet, apeChainTestnet];

const connectors = connectorsForWallets(
	[
		{
			groupName: glyphConnectorDetails.name,
			wallets: [glyphWalletRK],
		},
		{
			groupName: 'Popular',
			wallets: [rainbowWallet, coinbaseWallet, metaMaskWallet],
		},
		// {
		// 	groupName: 'Other',
		// 	wallets: [walletConnectWallet],
		// },
	],
	{
		appName: 'lend.fam',
		projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID',
	},
);

export const wagmiConfig = createConfig({
	chains: supportedChains,
	transports: supportedChains.reduce(
		(acc, chain) => {
			acc[chain.id] = http();
			return acc;
		},
		{} as Record<number, Transport>,
	),
	connectors,
});

export const chains = {
	mainnet: apeChainMainnet,
	testnet: apeChainTestnet,
};

export const getBlockExplorerUrl = (chainId: number): string => {
	if (chainId === 33139) {
		return import.meta.env.VITE_APECHAIN_MAINNET_BLOCK_EXPLORER || 'https://apescan.io';
	} else if (chainId === 33111) {
		return import.meta.env.VITE_APECHAIN_CURTIS_BLOCK_EXPLORER || 'https://curtis.apescan.io';
	}
	return 'https://apescan.io';
};
