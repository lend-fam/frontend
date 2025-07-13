import type { FC } from 'react';
import { MarketsMetrics } from '../markets-metrics/markets-metrics.components';
import { MarketsSupplyTable } from '../markets-supply-table/markets-supply-table.component';
import { Layout } from '../../layout/layout.component';
import { MarketsBorrowTable } from '../markets-borrow-table/markets-borrow-table.component';
import { useAllMarkets, useUnderlyingTokens, useMarketEvents } from '../../../hooks';

import css from './markets-page.module.css';

export const MarketsPage: FC = () => {
	const { data: markets } = useAllMarkets();
	const { data: tokens } = useUnderlyingTokens(markets ? [...markets] : []);

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
