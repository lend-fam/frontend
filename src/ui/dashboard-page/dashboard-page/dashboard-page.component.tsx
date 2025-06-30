import type { FC } from 'react';
import { MarketsMetrics } from '../dashboard-metrics/dashboard-metrics.components';
import { Layout } from '../../layout/layout.component';

import css from './dashboard-page.module.css';

export const DashboardPage: FC = () => {
	return (
		<div className={css.container}>
			<Layout>
				<MarketsMetrics />
			</Layout>
		</div>
	);
};
