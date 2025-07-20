import { type FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ApolloProvider } from '@apollo/client';
import { hashFn } from '@wagmi/core/query';
// import { GlyphProvider, StrategyType, WalletClientType } from '@use-glyph/sdk-react';
import { Header } from '../header/header.component';
import { LandingPage } from '../landing-page';
import { MarketsPage } from '../dashboard-page/markets-page/markets-page.component';
import { MarketsOverviewPage } from '../markets-overview-page';
import { MarketDetailPage } from '../market-detail-page';
import { FaucetPage } from '../faucet-page/faucet-page.component';
import { CollectionsPage } from '../collections-page';
import { CollectionDetailPage } from '../collection-detail-page';
import { Footer } from '../footer/footer.component';
import { wagmiConfig } from '../../config/wagmi.config';
import { apolloClient } from '../../config/apollo';
import { TransactionProvider } from '../../contexts/transaction.context';
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
		},
	},
});

export const App: FC = () => {
	return (
		<BrowserRouter>
			<WagmiProvider config={wagmiConfig}>
				<QueryClientProvider client={queryClient}>
					<RainbowKitProvider>
						{/* <GlyphProvider
							strategy={StrategyType.PRIVY}
						> */}
						<ApolloProvider client={apolloClient}>
							<DesignThemeProvider>
								<TransactionProvider>
									<div className={css.container}>
										<Header />
										<Routes>
											<Route path="/" element={<LandingPage />} />
											<Route path="/dashboard" element={<MarketsPage />} />
											<Route path="/markets" element={<MarketsOverviewPage />} />
											<Route path="/markets/:marketAddress" element={<MarketDetailPage />} />
											<Route path="/collections" element={<CollectionsPage />} />
											<Route
												path="/collections/:collectionAddress"
												element={<CollectionDetailPage />}
											/>
											<Route path="/profile" element={<MarketsPage />} />
											<Route path="/faucet" element={<FaucetPage />} />
										</Routes>
										<Footer />
									</div>
									<ReactQueryDevtools initialIsOpen={false} />
								</TransactionProvider>
							</DesignThemeProvider>
						</ApolloProvider>
						{/* </GlyphProvider> */}
					</RainbowKitProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</BrowserRouter>
	);
};
