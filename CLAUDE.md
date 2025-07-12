# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important
- ALL instructions within this document MUST BE FOLLOWED, these are not optional unless explicitly stated.
- ASK FOR CLARIFICATION If you are uncertain of any of thing within the document.
- DO NOT edit more code than you have to.
- DO NOT WASTE TOKENS, be succinct and concise.


## Development Commands

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Check code formatting
npm run prettier

# Format code
npm run prettier:fix
```

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
- **Service layer abstraction**: Use service classes for business logic (MarketService, TokenService)
- **Batched contract reads**: Use `useReadContracts` for multiple contract calls
- **Caching strategy**: Configure appropriate stale times for different data types in React Query
- **Error handling**: Implement consistent transaction state management with retries

### Component Architecture
- **UI Kit separation**: Reusable components in `src/ui-kit/`, feature-specific in `src/ui/`
- **Theme overrides**: Accept optional `theme` prop using `useTheme` hook
- **Co-location**: Keep component, styles, and types together
- **Automatic types**: CSS Modules generate TypeScript definitions via `vite-css-modules`

## Memories
- Always use contect7 mcp for getting docs
- NEVER hardcode dynamic values
- Do not use run dev directly it is infinit command