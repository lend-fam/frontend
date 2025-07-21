import { type FC, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ApolloProvider } from '@apollo/client';
import { hashFn } from '@wagmi/core/query';
import { GlyphProvider, StrategyType, WalletClientType } from '@use-glyph/sdk-react';
import { Header } from '../header/header.component';
import { LandingPage } from '../landing-page';
import { MarketsPage } from '../dashboard-page/markets-page/markets-page.component';
import { MarketsOverviewPage } from '../markets-overview-page';
import { MarketDetailPage } from '../market-detail-page';
import { FaucetPage } from '../faucet-page/faucet-page.component';
import { CollectionsPage } from '../collections-page';
import { CollectionDetailPage } from '../collection-detail-page';
import { ComingSoonPage } from '../coming-soon-page';
import { Footer } from '../footer/footer.component';
import { wagmiConfig } from '../../config/wagmi.config';
import { apolloClient } from '../../config/apollo';
import { TransactionProvider } from '../../contexts/transaction.context';
import { ToastProvider } from '../../contexts/toast.provider';
import { DesignThemeProvider } from '../../ui-kit/providers/design-theme-provider';

import css from './app.module.css';
import '../../assets/fonts/fonts.css';
import '../../styles/design-tokens.css';
import '@rainbow-me/rainbowkit/styles.css';
import '@use-glyph/sdk-react/style.css';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryKeyHashFn: hashFn,
			staleTime: 60_000, // 1 minute default (increased from 30s)
			refetchOnWindowFocus: false, // Reduce aggressive refetching
			refetchOnMount: false, // Prevent refetch on component remount
			retry: 1, // Reduce retry attempts from 2 to 1
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 2000), // Faster retry delays
		},
	},
});

const AppContent: FC = () => {
	return (
		<div className={css.container}>
			<Header />
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/dashboard" element={<MarketsPage />} />
				<Route path="/markets" element={<MarketsOverviewPage />} />
				<Route path="/markets/:marketAddress" element={<MarketDetailPage />} />
				<Route
					path="/collections"
					element={
						import.meta.env.MODE === 'prod' ? (
							<ComingSoonPage
								title="Collections"
								description="Explore NFT collections and their lending opportunities"
							/>
						) : (
							<CollectionsPage />
						)
					}
				/>
				<Route
					path="/collections/:collectionAddress"
					element={
						import.meta.env.MODE === 'prod' ? (
							<ComingSoonPage
								title="Collection Details"
								description="View detailed information about this NFT collection"
							/>
						) : (
							<CollectionDetailPage />
						)
					}
				/>
				<Route
					path="/profile"
					element={
						import.meta.env.MODE === 'prod' ? (
							<ComingSoonPage title="Profile" description="Manage your lending portfolio and settings" />
						) : (
							<MarketsPage />
						)
					}
				/>
				<Route path="/faucet" element={<FaucetPage />} />
			</Routes>
			<Footer />
		</div>
	);
};

export const App: FC = () => {
	// Suppress Glyph SDK debug logs
	useEffect(() => {
		if (import.meta.env.PROD || import.meta.env.VITE_GLYPH_DEBUG !== 'true') {
			const originalLog = console.log;
			console.log = (...args: unknown[]) => {
				const message = args.join(' ');
				// Filter out Glyph SDK debug messages
				if (
					message.includes('[GlyphWidget/') ||
					message.includes('PrivyWalletProvider.request') ||
					message.includes('[Glyph')
				) {
					return;
				}
				originalLog.apply(console, args);
			};

			// Cleanup on unmount
			return () => {
				console.log = originalLog;
			};
		}
	}, []);

	return (
		<BrowserRouter>
			<WagmiProvider config={wagmiConfig}>
				<QueryClientProvider client={queryClient}>
					<RainbowKitProvider>
						<GlyphProvider
							strategy={StrategyType.EIP1193}
							walletClientType={WalletClientType.RAINBOWKIT}
							askForSignature={false}>
							<ApolloProvider client={apolloClient}>
								<DesignThemeProvider>
									<ToastProvider>
										<TransactionProvider>
											<AppContent />
											<ReactQueryDevtools initialIsOpen={false} />
										</TransactionProvider>
									</ToastProvider>
								</DesignThemeProvider>
							</ApolloProvider>
						</GlyphProvider>
					</RainbowKitProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</BrowserRouter>
	);
};
