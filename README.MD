# Lend.fam Frontend

A React + TypeScript frontend application for the lend.fam MVP platform - an NFT collection-backed lending protocol built on ApeChain.

## Features

- **NFT Collection-Backed Lending**: Supply and borrow against NFT collection vaults
- **Multi-Wallet Support**: MetaMask, Coinbase Wallet, Rainbow, and Glyph wallet integrations  
- **Real-time Market Data**: Live APY charts, liquidity metrics, and portfolio tracking
- **Testnet Faucet**: Built-in faucet with CAPTCHA protection for test tokens and NFTs
- **Responsive Design**: Optimized for desktop and mobile experiences

## Technology Stack

- **React 18.3** with TypeScript for component development
- **Vite 7.0** for build tooling and fast development
- **Wagmi 2.15** + **RainbowKit 2.2** for Web3 wallet management
- **Apollo Client 3.11** for GraphQL data fetching
- **Recharts 2.12** for data visualization
- **CSS Modules** with automatic TypeScript definitions

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) runtime (recommended) or Node.js 18+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lend-fam/frontend.git
cd frontend
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
bun run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Environment Configuration

### Required Variables

```bash
# Contract Addresses
VITE_COMPTROLLER_ADDRESS_MAINNET=0x7E81fAaF1132A17DCc0C76b1280E0C0e598D5635
VITE_COMPTROLLER_ADDRESS_TESTNET=0x7E81fAaF1132A17DCc0C76b1280E0C0e598D5635

# RPC Endpoints (optional - fallback to defaults)
VITE_APECHAIN_MAINNET_RPC_HTTP=https://rpc.apechain.com/http
VITE_APECHAIN_CURTIS_RPC_HTTP=https://curtis.rpc.caldera.xyz/http

# External Services
VITE_GRAPHQL_ENDPOINT=<your_subgraph_endpoint>
VITE_WALLETCONNECT_PROJECT_ID=<your_project_id>
VITE_TURNSTILE_SITE_KEY=<cloudflare_turnstile_key>
```

## Development Commands

```bash
# Development
bun run dev              # Start development server
bun run dev:prod         # Development server with production config

# Building
bun run build            # Build for production
bun run build:develop    # Build with development config
bun run preview          # Preview production build

# Code Quality
bun run lint             # Check code style
bun run lint:fix         # Fix linting issues
bun run prettier         # Check formatting
bun run prettier:fix     # Format code

# GraphQL
bun run codegen          # Generate GraphQL types
bun run codegen:watch    # Watch mode for GraphQL generation
```

## Architecture Overview

### Project Structure

```
src/
├── components/          # Shared React components
├── config/             # Configuration files (wagmi, apollo)
├── contracts/          # Smart contract ABIs and addresses
├── hooks/              # Custom React hooks for data fetching
├── services/           # Business logic and utility services
├── ui-kit/            # Reusable UI components library
├── ui/                # Feature-specific UI components
├── types/             # TypeScript type definitions
└── utils/             # Helper functions and utilities
```

### Key Features

#### Web3 Integration
- **Multi-chain Support**: ApeChain mainnet and testnet with Curtis RPC prioritization
- **Wallet Management**: Seamless connection with popular Web3 wallets
- **Contract Interactions**: Type-safe smart contract calls using Wagmi and Viem
- **Real-time Updates**: Automatic blockchain state synchronization

#### User Experience
- **Transaction Flows**: Intuitive supply, borrow, withdraw, and repay interfaces
- **Portfolio Dashboard**: Comprehensive view of user positions and metrics
- **Market Discovery**: Browse available lending markets with real-time data
- **Responsive Design**: Optimized for all screen sizes

#### Developer Experience
- **Type Safety**: Full TypeScript coverage with generated types
- **Component Library**: Reusable UI components with theming support
- **Development Tools**: Hot reload, linting, and formatting automation
- **Documentation**: Comprehensive inline documentation and README files

## Supported Networks

- **ApeChain Mainnet** (Chain ID: 33139)
- **ApeChain Testnet (Curtis)** (Chain ID: 33111)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use CSS Modules for component styling
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## Deployment

### Docker

```bash
# Build production image
docker build -t lend-family-app .

# Run container
docker run -p 80:80 lend-family-app
```

### Docker Compose

```bash
# Production deployment
docker-compose up -d

# Development with hot reload
docker-compose -f docker-compose.develop.yml up -d
```

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Links

- **Website**: [lend.family](https://lend.family)
- **Documentation**: [GitHub Wiki](https://github.com/lend-fam/frontend/wiki)
- **Issues**: [GitHub Issues](https://github.com/lend-fam/frontend/issues)
- **Discord**: [Join our community](https://discord.gg/lend-fam)
