import type { FC } from 'react';
import { MarketsMetrics } from '../markets-metrics/markets-metrics.components';
import { MarketsSupplyTable } from '../markets-supply-table/markets-supply-table.component';
import { Layout } from '../../layout/layout.component';
import { MarketsBorrowTable } from '../markets-borrow-table/markets-borrow-table.component';
import { useAllMarkets } from '../../../hooks/use-markets.hook';
import { useUnderlyingTokens } from '../../../hooks/use-underlying-tokens.hook';
import { useMarketEvents } from '../../../hooks/use-market-events.hook';

import css from './markets-page.module.css';

export const MarketsPage: FC = () => {
	const { data: markets } = useAllMarkets();
	const { data: tokens } = useUnderlyingTokens(markets ? [...markets] : []);

	// Set up WebSocket event listeners for real-time data updates
	useMarketEvents({
		marketAddresses: markets ? [...markets] : [],
		tokenAddresses: tokens ? Object.values(tokens) : [],
		enabled: true,
	});

	return (
		<div className={css.container}>
			<Layout>
				<MarketsMetrics />
				<div className={css.tables}>
					<MarketsSupplyTable />
					<MarketsBorrowTable />
				</div>
			</Layout>
		</div>
	);
};
