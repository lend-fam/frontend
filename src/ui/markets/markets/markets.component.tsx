import type { FC } from 'react';
import { MarketsMetrics } from '../markets-metrics/markets-metrics.components';
import { Layout } from '../../layout/layout.component';

import css from './markets.module.css';

export const Markets: FC = () => {
	return (
		<div className={css.container}>
			<Layout>
				<MarketsMetrics />
			</Layout>
		</div>
	);
};
