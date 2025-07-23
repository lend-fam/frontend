# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important

- ALL instructions within this document MUST BE FOLLOWED, these are not optional unless explicitly stated.
- ASK FOR CLARIFICATION If you are uncertain of any of thing within the document.
- DO NOT edit more code than you have to.
- DO NOT WASTE TOKENS, be succinct and concise.

## Memories

- Always use context7 mcp for getting docs
- NEVER hardcode dynamic values
- Do not use run dev directly it is infinite command
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

# GraphQL code generation
bun run codegen

# Watch mode for GraphQL codegen
bun run codegen:watch
```

### Build Modes

- `bun run dev` - Development mode with develop configuration
- `bun run dev:prod` - Development server with production configuration
- `bun run build` - Production build
- `bun run build:develop` - Development build (sets base path to `/development/`)

## Architecture Overview

### Project Structure

This is a React + TypeScript frontend application built with Vite for the lend.fam MVP platform. The application serves as the user interface for an NFT collection-backed lending protocol on ApeChain.

### Key Technologies

- **React 18.3.1** with TypeScript for component development
- **Vite 7.0.0** for build tooling and development server with CSS Modules support
- **Wagmi 2.15.2 + RainbowKit 2.2.8** for Web3 wallet connection and management
- **Viem 2.29.2** for low-level Web3 operations and type-safe contract interactions
- **Apollo Client 3.11.11** for GraphQL data management with automatic code generation
- **React Query 5.76.0** (via @tanstack/react-query) for caching and synchronization
- **Recharts 2.12.7** for data visualization and charting
- **React Router DOM 7.6.3** for navigation
- **CSS Modules** with `vite-css-modules` plugin for automatic TypeScript definitions
- **ESLint + Prettier** for code quality and formatting

### Build Configuration

- **TypeScript Project References**: Uses `tsconfig.app.json` and `tsconfig.node.json` for optimized builds
- **CSS Modules**: Automatic `.d.ts` generation via `vite-css-modules` with `generateSourceTypes: true`
- **Vite Aliases**: React dependency resolution fixes for Glyph SDK compatibility
- **Build Optimization**: Custom rollup config to suppress PURE annotation warnings from viem

### Key Architectural Patterns

#### Service Layer Design (`src/services/`)

- **Pure static methods**: All service classes use static methods for predictable behavior
- **MarketService**: APY calculations, balance formatting, collateral eligibility checks
- **TokenService**: Token metadata management and balance conversions
- **PriceService**: USD value calculations and price formatting
- **HealthFactorService**: Liquidation risk calculations and collateral management
- **FormattingService**: Token balance and USD value formatting with compact notation
- **MathService**: Financial calculations and borrow safety checks
- **FaucetService**: Testnet token and NFT distribution logic
- **NativeYieldService**: APE native yield integration

#### Custom Hooks Architecture (`src/hooks/`)

- **Market data management**: Dedicated hooks for market data, user positions, liquidity calculations
- **Performance optimization**: Separate `-optimized.hook.ts` variants for high-frequency operations
- **Transaction state**: `useTransactionFlow` hook manages approval/execution lifecycle
- **Account queries**: Specialized hooks for balance tracking, collateral status, portfolio metrics
- **Historical data**: Chart and APY historical data hooks with debugging variants
- **Query optimization**: Consistent use of `enabled` conditions to prevent unnecessary calls
- **Toast system**: Global notification management with clipboard integration
- **Market events**: Real-time market event monitoring and processing

#### Web3 Integration (`src/config/`)

- **Wagmi Configuration**: Multi-chain support for ApeChain mainnet (33139) and testnet (33111)
- **RPC Configuration**: Curtis RPC prioritized over native ApeChain RPC for reliability
- **Multi-wallet Integration**: MetaMask, Coinbase Wallet, Rainbow, and Glyph wallet support
- **Transport Configuration**: HTTP transports with timeout (5s), retry count (2), and retry delay (1s)
- **Chain Utilities**: Helper functions for chain display names and block explorer URLs

#### Component Architecture

- **UI Kit (`src/ui-kit/`)**: Reusable components with theming support
  - Generic `Table` component with type-safe column definitions and custom renderers
  - Base transaction modal with approval flow and state management
  - Themed components using CSS modules with runtime theme override capability
  - Utility functions like `typedMemo` for type-safe component memoization
- **Feature Components (`src/ui/`)**: Page-specific components organized by feature
  - Market-focused components (supply/borrow tables, detail pages)
  - Collection management components for NFT vault operations
  - Faucet components with Cloudflare Turnstile CAPTCHA integration

#### GraphQL Architecture (`src/graphql/`)

- **Code Generation**: Automatic TypeScript types and hooks via `@graphql-codegen/cli`
- **Schema-driven Development**: `src/graphql/schema.graphql` defines data contracts
- **Generated Hooks**: Type-safe React hooks for all GraphQL operations
- **Scalar Mapping**: Custom scalar types (BigInt, Bytes, Timestamp) mapped to TypeScript
- **Apollo Integration**: Centralized GraphQL state management with caching strategies

#### Contract Integration (`src/contracts/`)

- **Type-safe ABIs**: Generated TypeScript interfaces for all contract interactions
- **Multi-contract Support**: Comptroller, CToken, ERC20, Oracle, and test contract ABIs
- **Environment-driven Configuration**: Contract addresses via environment variables
- **Address Type Safety**: Use `Address` type from viem for all blockchain addresses

## Environment Configuration

### Required Environment Variables

```bash
# Contract Addresses
VITE_COMPTROLLER_ADDRESS_MAINNET=0x7E81fAaF1132A17DCc0C76b1280E0C0e598D5635
VITE_COMPTROLLER_ADDRESS_TESTNET=0x7E81fAaF1132A17DCc0C76b1280E0C0e598D5635

# RPC Endpoints (with fallback defaults)
VITE_APECHAIN_MAINNET_RPC_HTTP=https://rpc.apechain.com/http
VITE_APECHAIN_MAINNET_RPC_WS=wss://rpc.apechain.com/ws
VITE_APECHAIN_CURTIS_RPC_HTTP=https://curtis.rpc.caldera.xyz/http
VITE_APECHAIN_CURTIS_RPC_WS=wss://curtis.rpc.caldera.xyz/ws

# External Services
VITE_GRAPHQL_ENDPOINT=<subgraph_endpoint>
VITE_WALLETCONNECT_PROJECT_ID=<walletconnect_project_id>
VITE_TURNSTILE_SITE_KEY=<cloudflare_turnstile_key>

# Block Explorers (optional)
VITE_APECHAIN_MAINNET_BLOCK_EXPLORER=https://apescan.io
VITE_APECHAIN_CURTIS_BLOCK_EXPLORER=https://curtis.apescan.io
```

### Chain Configuration

- **ApeChain Mainnet**: Chain ID 33139, Curtis RPC prioritized over native RPC
- **ApeChain Testnet (Curtis)**: Chain ID 33111, Curtis RPC only
- **Native Currency**: ApeCoin (APE) with 18 decimals
- **Block Explorer**: ApeScan (apescan.io and curtis.apescan.io)

## Critical Development Rules

### Code Standards

- **No hardcoded values**: All contract addresses and configuration via environment variables
- **Type-first development**: Use `typedMemo` for all component memoization
- **CSS Modules pattern**: Co-locate `.module.css` with components for scoped styles
- **Viem Address types**: Use `Address` type from viem for all blockchain addresses
- **Service layer abstraction**: Use static service methods for business logic

### Web3 Integration Patterns

- **Batched contract reads**: Use `useReadContracts` for multiple contract calls
- **Optimized queries**: Use specialized optimized hooks (e.g., `use-market-data-optimized`) for performance-critical operations
- **Caching strategy**: Configure appropriate stale times for different data types in React Query
- **Error handling**: Implement consistent transaction state management with retries
- **APY calculations**: Annual Percentage Yield computed from block rates using `BLOCKS_PER_YEAR` constant
- **Balance formatting**: Context-aware token display with compact notation for large amounts
- **Contract interactions**: Standardized patterns for mint/redeem/borrow/repay operations
- **Health factor monitoring**: Real-time liquidation risk calculations with safety buffers
- **Multi-data source**: Combine on-chain contract data with GraphQL subgraph historical data

### Component Development Patterns

- **UI Kit separation**: Reusable components in `src/ui-kit/`, feature-specific in `src/ui/`
- **Theme overrides**: Accept optional `theme` prop using `useTheme` hook
- **Co-location**: Keep component, styles, and types together
- **Automatic types**: CSS Modules generate TypeScript definitions via `vite-css-modules`
- **Transaction Flow Architecture**:
  - Modal-based interactions with consistent approval/execution patterns
  - ERC20 approval followed by contract interaction with auto-progression
  - User preferences for unlimited vs exact approval amounts (localStorage)
  - Comprehensive loading/success/error states for all transactions
  - Compact notation parsing (`1k`, `1m`, `1b` input formats)
  - Context-aware max amounts based on wallet balance, liquidity, and market constraints

## Testing and Quality Assurance

### Code Quality Tools

- **ESLint Configuration**: Modern flat config with React, TypeScript, and hooks plugins
- **Prettier Integration**: Automatic code formatting with GraphQL codegen hooks
- **TypeScript Strict Mode**: Full type coverage with project references
- **CSS Modules Types**: Compile-time style checking with generated `.d.ts` files

### Development Best Practices

- **Component Memoization**: Use `typedMemo` utility for type-safe React.memo
- **Query Optimization**: Implement `enabled` conditions to prevent unnecessary API calls
- **Performance Monitoring**: Separate optimized hooks for high-frequency operations
- **Error Boundaries**: Implement consistent error handling across transaction flows
- **Accessibility**: Follow WCAG guidelines for inclusive design
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox

## Deployment Configuration

### Docker Support

- **Multi-stage Build**: Optimized Dockerfile with Bun runtime
- **Nginx Serving**: Production container with nginx for static file serving
- **Docker Compose**: Development and production deployment configurations
- **Environment Handling**: Runtime environment variable injection

### Build Modes

- **Development Mode**: Base path `/development/` for deployment environments
- **Production Mode**: Root path `/` for main deployment
- **Preview Mode**: Local production build testing

## Testnet Faucet with CAPTCHA Protection

### Implementation Details

- **Route**: `/faucet` - testnet-only feature (Chain ID 33111)
- **CAPTCHA**: Cloudflare Turnstile integration with `@marsidev/react-turnstile`
- **Token Distribution**: USDC, WETH test tokens via contract interactions
- **NFT Distribution**: Test collection NFTs for protocol testing
- **Security**: CAPTCHA verification required before mint operations

### Setup Requirements

1. Configure `VITE_TURNSTILE_SITE_KEY` environment variable
2. Set up Cloudflare Turnstile site configuration
3. Add domains to Turnstile site settings
4. Reference `docs/TURNSTILE_SETUP.md` for detailed instructions

### Security Features

- **Chain Restriction**: Faucet only available on ApeChain Testnet
- **Rate Limiting**: CAPTCHA-based abuse prevention
- **Development Bypass**: Auto-bypasses CAPTCHA when site key not configured
- **Secure Transactions**: Uses wagmi for blockchain interactions

## Development Notes

- **WalletConnect**: Currently uses RainbowKit's default project ID - update for production
- **Curtis RPC Priority**: Curtis endpoints prioritized for better reliability and performance
- **Transaction Tolerance**: 0.1% buffer applied to max available amounts for edge cases
- **Auto-close Behavior**: Successful transactions auto-close modals and reset state
- **Design System**: Comprehensive design token system with CSS custom properties
- **Font Loading**: Custom Inter and Montserrat font integration with CSS modules
