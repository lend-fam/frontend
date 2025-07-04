import { type FC } from 'react';
import { Table, type TableColumnProps, type TableData } from '../../../ui-kit/components/table/table.component';
import { AssetsColumn } from './columns/assets-column/assets-column.component';
import { CollateralColumn } from './columns/collateral-column/collateral-column.component';

import css from './markets-supply-table.module.css';

type MarketsSupplyTableData = {
	assets: string;
	apy: string;
	wallet: string;
};

type MarketsSupplyTableColumn = 'assets' | 'apy' | 'wallet' | 'collateral';

const marketsSupplyTableColumns: TableColumnProps<MarketsSupplyTableData, MarketsSupplyTableColumn>[] = [
	{ key: 'assets', label: 'Asset', cellRenderer: AssetsColumn },
	{ key: 'apy', label: 'APY', align: 'right' },
	{ key: 'wallet', label: 'Wallet', align: 'right' },
	{ key: 'collateral', label: 'Collateral', align: 'center', cellRenderer: CollateralColumn },
];

const dashboardSupplyTableData: TableData<MarketsSupplyTableData>[] = [
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

export const MarketsSupplyTable: FC = () => {
	return (
		<div className={css.container}>
			<p className={css.label}>Supply Markets</p>

			<Table<MarketsSupplyTableColumn, MarketsSupplyTableData>
				columns={marketsSupplyTableColumns}
				data={dashboardSupplyTableData}
			/>
		</div>
	);
};
