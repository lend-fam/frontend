import { type FC } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { hashFn } from '@wagmi/core/query';
import { Header } from '../header/header/header.component';
import { MarketsPage } from '../markets-page/markets-page/markets-page.component';
import { Footer } from '../footer/footer/footer.component';
import { wagmiConfig } from '../../config/wagmi.config';

import css from './app.module.css';
import '../../assets/fonts/fonts.css';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryKeyHashFn: hashFn,
		},
	},
});

export const App: FC = () => {
	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider>
					<div className={css.container}>
						<Header />
						<MarketsPage />
						<Footer />
					</div>
					<ReactQueryDevtools initialIsOpen={false} />
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
};
