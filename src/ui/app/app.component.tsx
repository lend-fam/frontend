import { type FC, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ApolloProvider } from '@apollo/client';
import { hashFn } from '@wagmi/core/query';
import { GlyphProvider, StrategyType, WalletClientType } from '@use-glyph/sdk-react';
import { useWalletAnalytics } from '../../hooks/use-wallet-analytics.hook';
import { usePageAnalytics } from '../../hooks/use-page-analytics.hook';
import { Header } from '../header/header.component';
import { Footer } from '../footer/footer.component';

// Lazy load major page components for code splitting
const LandingPage = lazy(() =>
	import('../landing-page').then((module) => ({ default: module.LandingPage }))
);
const MarketsPage = lazy(() =>
	import('../dashboard-page/markets-page/markets-page.component').then((module) => ({
		default: module.MarketsPage,
	}))
);
const MarketsOverviewPage = lazy(() =>
	import('../markets-overview-page').then((module) => ({ default: module.MarketsOverviewPage }))
);
const MarketDetailPage = lazy(() =>
	import('../market-detail-page').then((module) => ({ default: module.MarketDetailPage }))
);
const FaucetPage = lazy(() =>
	import('../faucet-page/faucet-page.component').then((module) => ({ default: module.FaucetPage }))
);
const CollectionsPage = lazy(() =>
	import('../collections-page').then((module) => ({ default: module.CollectionsPage }))
);
const CollectionDetailPage = lazy(() =>
	import('../collection-detail-page').then((module) => ({ default: module.CollectionDetailPage }))
);
const ComingSoonPage = lazy(() =>
	import('../coming-soon-page').then((module) => ({ default: module.ComingSoonPage }))
);

// Simple loading fallback component for Suspense
const PageLoadingFallback: FC = () => (
	<div className={css.loadingFallback}>
		<div className={css.loadingSpinner} />
	</div>
);

import { wagmiConfig } from '../../config/wagmi.config';
import { apolloClient } from '../../config/apollo';
import { TransactionProvider } from '../../contexts/transaction.context';
import { ToastProvider } from '../../contexts/toast.provider';
import { AnalyticsProvider } from '../../contexts/analytics.provider';
import { DesignThemeProvider } from '../../ui-kit/providers/design-theme-provider';

import css from './app.module.css';
import './reset.css';
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
	// Track wallet connection events
	useWalletAnalytics();
	
	// Track page views
	usePageAnalytics();

	return (
		<div className={css.container}>
			<Header />
			<Suspense fallback={<PageLoadingFallback />}>
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
			</Suspense>
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

	// Enhanced environment detection with fallbacks
	const viteAppEnv = import.meta.env.VITE_APP_ENVIRONMENT;
	const viteMode = import.meta.env.MODE;
	const viteDev = import.meta.env.DEV;
	
	// Multiple detection methods with fallbacks
	const isDevelop = 
		viteAppEnv === 'develop' ||               // Primary: explicit env var
		viteMode === 'develop' ||                 // Fallback 1: vite mode
		(viteDev && viteMode !== 'production');   // Fallback 2: dev mode unless explicitly production
	
	const basename = isDevelop ? '/development' : undefined;
	
	// Enhanced debug logging (visible in browser console)
	console.log('🔧 Environment Debug:', {
		'VITE_APP_ENVIRONMENT': viteAppEnv,
		'import.meta.env.MODE': viteMode,
		'import.meta.env.DEV': viteDev,
		'import.meta.env.PROD': import.meta.env.PROD,
		'isDevelop (computed)': isDevelop,
		'basename': basename,
		'detection_method': viteAppEnv === 'develop' ? 'VITE_APP_ENVIRONMENT' : 
		                   viteMode === 'develop' ? 'MODE' : 'DEV_FALLBACK'
	});

	return (
		// Development mode uses /development basename for proper routing
		<BrowserRouter basename={basename}>

			<WagmiProvider config={wagmiConfig}>
				<QueryClientProvider client={queryClient}>
					<RainbowKitProvider>
						<GlyphProvider
							strategy={StrategyType.EIP1193}
							walletClientType={WalletClientType.RAINBOWKIT}
							askForSignature={false}>
							<ApolloProvider client={apolloClient}>
								<DesignThemeProvider>
									<AnalyticsProvider>
										<ToastProvider>
											<TransactionProvider>
												<AppContent />
												<ReactQueryDevtools initialIsOpen={false} />
											</TransactionProvider>
										</ToastProvider>
									</AnalyticsProvider>
								</DesignThemeProvider>
							</ApolloProvider>
						</GlyphProvider>
					</RainbowKitProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</BrowserRouter>
	);
};
