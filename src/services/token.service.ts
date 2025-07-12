import type { Address } from 'viem';

// Common token symbol mappings for Compound markets
const TOKEN_SYMBOL_MAP: Record<string, string> = {
  'cMDAI': 'MDAI',
  'cMUSDC': 'MUSDC', 
  'cMUSDT': 'MUSDT',
  'cDAI': 'DAI',
  'cUSDC': 'USDC',
  'cUSDT': 'USDT',
  'cETH': 'ETH',
  'cWBTC': 'WBTC',
  'cAPE': 'APE',
  'cWETH': 'WETH',
};

// Known token addresses and their symbols (all lowercase for consistent lookup)
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
    // If it's a compound token (starts with 'c'), try to get the underlying
    if (symbol.startsWith('c') && symbol.length > 1) {
      const underlying = TOKEN_SYMBOL_MAP[symbol];
      if (underlying) {
        return underlying;
      }
      
      // If not in our map, try to strip the 'c' prefix
      const strippedSymbol = symbol.slice(1);
      return strippedSymbol;
    }
    
    return symbol;
  }

  /**
   * Get token name from address if known
   */
  static getTokenNameByAddress(address: Address): string | null {
    // Normalize address to lowercase for comparison
    const normalizedAddress = address.toLowerCase() as Address;
    return TOKEN_ADDRESS_MAP[normalizedAddress] || null;
  }

  /**
   * Format a display name for a market
   */
  static formatMarketName(symbol?: string, name?: string, address?: Address): string {
    // First try address mapping (highest priority)
    if (address) {
      const addressName = this.getTokenNameByAddress(address);
      if (addressName) {
        return addressName;
      }
    }

    // Then try to use the symbol
    if (symbol) {
      const tokenName = this.getTokenName(symbol);
      if (tokenName !== symbol) {
        return tokenName;
      }
    }

    // Try to use the name
    if (name && name !== symbol) {
      return name;
    }

    // Fallback to symbol or formatted address
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