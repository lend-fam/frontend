import { type FC } from 'react';
import { Table, type TableColumnProps, type TableData } from '../../../ui-kit/components/table/table.component';
import { AssetsColumn } from './dashboard-supply-assets-column/dashboard-supply-assets-column.component';
import { CollateralColumn } from './dashboard-supply-collateral-column/dashboard-supply-collateral-column.component';

import css from './dashboard-supply-table.module.css';

type DashboardSupplyTableData = {
	assets: string;
	apy: string;
	wallet: string;
};

type DashboardSupplyTableColumn = 'assets' | 'apy' | 'wallet' | 'collateral';

const dashboardSupplyTableColumns: TableColumnProps<DashboardSupplyTableData, DashboardSupplyTableColumn>[] = [
	{ key: 'assets', label: 'Asset', cellRenderer: AssetsColumn },
	{ key: 'apy', label: 'APY', align: 'right' },
	{ key: 'wallet', label: 'Wallet', align: 'right' },
	{ key: 'collateral', label: 'Collateral', align: 'center', cellRenderer: CollateralColumn },
];

const dashboardSupplyTableData: TableData<DashboardSupplyTableData>[] = [
	{
		assets: 'ApeCoin',
		apy: '3.41%',
		wallet: '0 APE',
	},
	{
		assets: 'ApeCoin',
		apy: '3.41%',
		wallet: '0 APE',
	},
	{
		assets: 'ApeCoin',
		apy: '3.41%',
		wallet: '0 APE',
	},
];

export const DashboardSupplyTable: FC = () => {
	return (
		<div className={css.container}>
			<p className={css.label}>Supply Markets</p>

			<Table<DashboardSupplyTableColumn, DashboardSupplyTableData>
				columns={dashboardSupplyTableColumns}
				data={dashboardSupplyTableData}
			/>
		</div>
	);
};
