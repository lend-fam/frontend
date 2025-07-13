import type { FC } from 'react';
import { Layout } from '../layout/layout.component';
import { UnifiedMarketsTable } from '../markets-page/unified-markets-table';
import { useAllMarkets, useUnderlyingTokens, useMarketEvents } from '../../hooks';

import css from './markets-overview-page.module.css';

export const MarketsOverviewPage: FC = () => {
	const { data: markets } = useAllMarkets();
	const { data: tokens } = useUnderlyingTokens(markets || []);

	useMarketEvents({
		marketAddresses: markets || [],
		tokenAddresses: tokens ? Object.values(tokens) : [],
		enabled: true,
	});

	return (
		<div className={css.container}>
			<Layout>
				<div className={css.header}>
					<h1 className={css.title}>Markets Overview</h1>
					<p className={css.subtitle}>Compare lending and borrowing rates across all supported assets</p>
				</div>
				<UnifiedMarketsTable />
			</Layout>
		</div>
	);
};
