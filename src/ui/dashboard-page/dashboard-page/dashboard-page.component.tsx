import type { FC } from 'react';
import { DashboardMetrics } from '../dashboard-metrics/dashboard-metrics.components';
import { DashboardSupplyTable } from '../dashboard-supply-table/dashboard-supply-table.component';
import { Layout } from '../../layout/layout.component';

import css from './dashboard-page.module.css';

export const DashboardPage: FC = () => {
	return (
		<div className={css.container}>
			<Layout>
				<DashboardMetrics />
				<div className={css.tables}>
					<DashboardSupplyTable />
				</div>
			</Layout>
		</div>
	);
};
