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
- **Wagmi Configuration**: Configured with multiple chains (mainnet, polygon, optimism, arbitrum, base)
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
- **Multi-chain Support**: Configured for mainnet, polygon, optimism, arbitrum, and base networks
- **State Management**: React Query handles Web3 state caching and updates

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

## Memories
- Always use contect7 mcp for getting docs
- Use webdev mcp for taking project screenshots