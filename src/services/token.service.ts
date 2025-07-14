import type { Address } from 'viem';
import type { TokenMetadata } from '../hooks/use-token-metadata.hook';

const TOKEN_SYMBOL_MAP: Record<string, string> = {
	cMDAI: 'MDAI',
	cMUSDC: 'MUSDC',
	cMUSDT: 'MUSDT',
	cDAI: 'DAI',
	cUSDC: 'USDC',
	cUSDT: 'USDT',
	cETH: 'ETH',
	cWBTC: 'WBTC',
	cAPE: 'APE',
	cWETH: 'WETH',
};

const TOKEN_ADDRESS_MAP: Record<Address, string> = {
	'0x642d97319cd50d2e5fc7f0fe022ed87407045e90': 'MDAI',
	'0x98137e7bb1643a97a08d2823cbe15b9bd63c5430': 'MUSDC',
	'0x580be4c51c2cbfb2b7f6fd3e17e1b53f10ab430d': 'MUSDT',
};

export class TokenService {
	/**
	 * Get a user-friendly token name from a Compound token symbol
	 */
	static getTokenName(symbol: string): string {
		if (symbol.startsWith('c') && symbol.length > 1) {
			const underlying = TOKEN_SYMBOL_MAP[symbol];
			if (underlying) {
				return underlying;
			}

			const strippedSymbol = symbol.slice(1);
			return strippedSymbol;
		}

		return symbol;
	}

	/**
	 * Get token name from address if known
	 */
	static getTokenNameByAddress(address: Address): string | null {
		const normalizedAddress = address.toLowerCase() as Address;
		return TOKEN_ADDRESS_MAP[normalizedAddress] || null;
	}

	/**
	 * Format a display name for a market using dynamic token metadata
	 */
	static formatMarketName(symbol?: string, name?: string, address?: Address, tokenMetadata?: TokenMetadata): string {
		// Use dynamic token metadata if available
		if (tokenMetadata) {
			// Prefer underlying token symbol for display
			if (tokenMetadata.underlyingSymbol) {
				return tokenMetadata.underlyingSymbol;
			}
			// Fall back to underlying token name
			if (tokenMetadata.underlyingName) {
				return tokenMetadata.underlyingName;
			}
			// Fall back to cToken symbol
			if (tokenMetadata.symbol) {
				return this.getTokenName(tokenMetadata.symbol);
			}
		}

		// Fall back to static mapping logic
		if (address) {
			const addressName = this.getTokenNameByAddress(address);
			if (addressName) {
				return addressName;
			}
		}

		if (symbol) {
			const tokenName = this.getTokenName(symbol);
			if (tokenName !== symbol) {
				return tokenName;
			}
		}

		if (name && name !== symbol) {
			return name;
		}

		if (symbol) {
			return symbol;
		}

		if (address) {
			return `${address.slice(0, 6)}...${address.slice(-4)}`;
		}

		return 'Unknown Token';
	}

	/**
	 * Check if a symbol represents a Compound token
	 */
	static isCompoundToken(symbol: string): boolean {
		return symbol.startsWith('c') && symbol.length > 1;
	}

	/**
	 * Get the underlying token symbol from a Compound token
	 */
	static getUnderlyingSymbol(compoundSymbol: string): string {
		if (this.isCompoundToken(compoundSymbol)) {
			return TOKEN_SYMBOL_MAP[compoundSymbol] || compoundSymbol.slice(1);
		}
		return compoundSymbol;
	}
}
