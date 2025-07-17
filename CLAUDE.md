# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important
- ALL instructions within this document MUST BE FOLLOWED, these are not optional unless explicitly stated.
- ASK FOR CLARIFICATION If you are uncertain of any of thing within the document.
- DO NOT edit more code than you have to.
- DO NOT WASTE TOKENS, be succinct and concise.

## Memories
- Always use contect7 mcp for getting docs
- NEVER hardcode dynamic values
- Do not use run dev directly it is infinit command
- Use websocket for live interactions with chain node
- Use cast to interact with blockchain

## Development Commands

### Frontend Development
```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint code
bun run lint

# Fix linting issues
bun run lint:fix

# Check code formatting
bun run prettier

# Format code
bun run prettier:fix
```

### TypeScript Configuration
- Uses TypeScript with project references via `tsconfig.app.json` and `tsconfig.node.json`
- Strict type checking enabled with CSS Modules type generation
- Vite configured with `vite-css-modules` plugin for automatic `.d.ts` generation

## Architecture Overview

### Project Structure
This is a React + TypeScript frontend application built with Vite for the lend.fam MVP platform. The application serves as the user interface for an NFT collection-backed lending protocol.

### Key Technologies
- **React 19** with TypeScript for component development
- **Vite** for build tooling and development server
- **CSS Modules** with automatic type generation for styling
- **Wagmi + RainbowKit** for Web3 wallet connection and management
- **Viem** for low-level Web3 operations
- **ESLint + Prettier** for code quality

### Architecture Patterns

#### Component Organization
- **UI Kit (`src/ui-kit/`)**: Reusable components with theming support
  - Generic `Table` component with configurable columns and renderers
  - Themed components using CSS modules with theme override capability
  - Utility functions like `typedMemo` for type-safe memoization

#### Web3 Integration (`src/config/`)
- **Wagmi Configuration**: Configured for ApeChain mainnet and testnet with fallback RPC endpoints
- **RainbowKit Integration**: Provides wallet connection UI and state management
- **React Query**: Powers wagmi's caching and synchronization

#### UI Structure (`src/ui/`)
- **App Component**: Main application shell with provider initialization
- **Layout System**: Responsive layout with header and footer
- **Markets Page**: Core lending interface with metrics and supply/borrow tables
- **Component Organization**: Feature-based folders with co-located styles

#### Styling System
- **CSS Modules**: Component-scoped styles with TypeScript definitions
- **Theme System**: `useTheme` hook for component theme overrides
- **Font Management**: Custom Inter and Montserrat font loading
- **CSS Reset**: Global reset styles for consistent rendering

#### Web3 Architecture
- **Wagmi Providers**: WagmiProvider, QueryClientProvider, and RainbowKitProvider wrap the app
- **Wallet Connection**: RainbowKit's ConnectButton in header for seamless wallet integration
- **ApeChain Support**: Configured for ApeChain mainnet (33139) and testnet (33111) with Curtis RPC prioritization
- **State Management**: React Query handles Web3 state caching and updates
- **Environment-driven Configuration**: Contract addresses and RPC endpoints via environment variables

### Development Patterns

#### Component Development
- Use `typedMemo` for type-safe component memoization
- CSS Modules with automatic `.d.ts` generation
- Component co-location: `.component.tsx`, `.module.css`, and type definitions together

#### Theming
- Components accept optional `theme` prop for style overrides
- `useTheme` hook merges default styles with theme overrides
- Enables component customization without style duplication

#### Type Safety
- Strict TypeScript configuration with project references
- Generated CSS Module types for compile-time style checking
- Generic table components with type-safe column definitions

#### Transaction Flow Architecture
- **Modal-based interactions**: Supply, Borrow, Withdraw, Repay modals with consistent patterns
- **Approval pattern**: ERC20 approval followed by contract interaction with auto-progression
- **User preferences**: Unlimited vs exact approval amounts stored in localStorage
- **State tracking**: Comprehensive loading/success/error states for all transactions
- **Compact notation parsing**: Supports `1k`, `1m`, `1b` input formats with automatic conversion
- **Auto-progression**: Successful approvals automatically trigger main transactions
- **Balance calculations**: Context-aware max amounts based on wallet balance, liquidity, and market constraints

## Environment Configuration

### Required Environment Variables
```bash
# Mainnet Configuration
VITE_COMPTROLLER_ADDRESS_MAINNET=0x7E81fAaF1132A17DCc0C76b1280E0C0e598D5635

# Testnet Configuration  
VITE_COMPTROLLER_ADDRESS_TESTNET=0x7E81fAaF1132A17DCc0C76b1280E0C0e598D5635

# RPC Endpoints (with fallback defaults)
VITE_APECHAIN_MAINNET_RPC_HTTP=https://rpc.apechain.com/http
VITE_APECHAIN_MAINNET_RPC_WS=wss://rpc.apechain.com/ws
VITE_APECHAIN_CURTIS_RPC_HTTP=https://curtis.rpc.caldera.xyz/http
VITE_APECHAIN_CURTIS_RPC_WS=wss://curtis.rpc.caldera.xyz/ws

# Cloudflare Turnstile (for testnet faucet)
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
```

### Chain Configuration
- **ApeChain Mainnet**: Chain ID 33139, Curtis RPC prioritized
- **ApeChain Testnet**: Chain ID 33111, Curtis RPC only
- **Native Currency**: ApeCoin (APE) with 18 decimals
- **Block Explorer**: ApeScan (apescan.io)

## Critical Development Rules

### Code Standards
- **No hardcoded values**: All contract addresses and configuration via environment variables
- **Type-first development**: Use `typedMemo` for all component memoization
- **CSS Modules pattern**: Co-locate `.module.css` with components for scoped styles
- **Viem Address types**: Use `Address` type from viem for all blockchain addresses

### Web3 Integration Patterns
- **Service layer abstraction**: Use service classes for business logic (MarketService, TokenService, PriceService)
- **Batched contract reads**: Use `useReadContracts` for multiple contract calls
- **Caching strategy**: Configure appropriate stale times for different data types in React Query
- **Error handling**: Implement consistent transaction state management with retries
- **APY calculations**: Annual Percentage Yield computed from block rates using `BLOCKS_PER_YEAR` constant
- **Balance formatting**: Context-aware token display with compact notation for large amounts
- **Contract interactions**: Standardized patterns for mint/redeem/borrow/repay operations

### Component Architecture
- **UI Kit separation**: Reusable components in `src/ui-kit/`, feature-specific in `src/ui/`
- **Theme overrides**: Accept optional `theme` prop using `useTheme` hook
- **Co-location**: Keep component, styles, and types together
- **Automatic types**: CSS Modules generate TypeScript definitions via `vite-css-modules`

## Key Architectural Patterns

### Custom Hooks Architecture
- **Market data management**: Dedicated hooks for market data, user positions, liquidity calculations
- **Transaction state**: `useTransactionFlow` hook manages approval/execution lifecycle
- **Account queries**: Specialized hooks for balance tracking, collateral status, portfolio metrics
- **Query optimization**: Consistent use of `enabled` conditions to prevent unnecessary calls

### Service Layer Design
- **MarketService**: APY calculations, balance formatting, collateral eligibility checks
- **TokenService**: Token metadata management and balance conversions
- **PriceService**: USD value calculations and price formatting
- **Pure functions**: All service methods are static for predictable behavior

### Component Composition Patterns
- **Generic Table**: Type-safe column definitions with custom cell/header renderers
- **Modal system**: Base transaction modal extended by specific operation modals
- **Action buttons**: Reusable button groups with state-aware rendering
- **Theme composition**: CSS Modules with runtime theme override capability

## Development Notes
- **WalletConnect**: Uses RainbowKit's default project ID - update for production
- **Curtis RPC Priority**: Curtis endpoints prioritized over ApeChain native RPC for reliability
- **Transaction tolerance**: 0.1% buffer applied to max available amounts for edge cases
- **Auto-close behavior**: Successful transactions auto-close modals and reset state

## Testnet Faucet with CAPTCHA Protection

### Overview
The testnet faucet (`/faucet` route) provides test tokens and NFTs for protocol testing on ApeChain Testnet. It includes Cloudflare Turnstile CAPTCHA protection to prevent abuse.

### Features
- **Native APE Faucet**: Direct link to official Caldera testnet faucet
- **Test ERC20 Tokens**: USDC, WETH for contract testing
- **Test NFTs**: Collection NFTs for testing collection-backed lending
- **CAPTCHA Protection**: Cloudflare Turnstile integration prevents bot abuse
- **Responsive Design**: Works on all screen sizes

### CAPTCHA Integration
- **Provider**: Cloudflare Turnstile (privacy-focused CAPTCHA alternative)
- **Configuration**: Requires `VITE_TURNSTILE_SITE_KEY` environment variable
- **Development Mode**: Auto-bypasses CAPTCHA when no key is configured
- **User Flow**: Users must complete CAPTCHA before accessing mint functions

### Setup Instructions
1. Create Cloudflare Turnstile site at https://dash.cloudflare.com/turnstile
2. Add your domain(s) to the site configuration
3. Copy the Site Key to `VITE_TURNSTILE_SITE_KEY` environment variable
4. See `TURNSTILE_SETUP.md` for detailed setup instructions

### Security Features
- **Testnet Only**: Faucet only appears on ApeChain Testnet (Chain ID 33111)
- **CAPTCHA Verification**: Required before any mint operations
- **Rate Limiting**: Inherent protection through CAPTCHA challenges
- **Smart Contract Interaction**: Uses wagmi for secure blockchain transactions