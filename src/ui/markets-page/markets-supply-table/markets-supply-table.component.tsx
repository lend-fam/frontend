import { type FC } from 'react';
import { Table, type TableColumnProps, type TableData } from '../../../ui-kit/components/table/table.component';
import { AssetsColumn } from '../../../ui-kit/components/table/columns/assets-column/assets-column.component';
import { CollateralColumn } from '../../../ui-kit/components/table/columns/collateral-column/collateral-column.component';

import css from './markets-supply-table.module.css';
import tableCss from './theme/table.module.css';

type MarketsSupplyTableData = {
	assets: string;
	apy: string;
	wallet: string;
};

type MarketsSupplyTableColumn = 'assets' | 'apy' | 'wallet' | 'collateral';

const marketsSupplyTableColumns: TableColumnProps<MarketsSupplyTableData, MarketsSupplyTableColumn>[] = [
	{ key: 'assets', label: 'Asset', width: '196px', cellRenderer: AssetsColumn },
	{ key: 'apy', label: 'APY', align: 'right' },
	{ key: 'wallet', label: 'Wallet', align: 'right' },
	{ key: 'collateral', label: 'Collateral', width: '184px', align: 'center', cellRenderer: CollateralColumn },
];

const yourMarketsSupplyTableData: TableData<MarketsSupplyTableData>[] = [
	{
		assets: 'ApeCoin',
		apy: '3.41%',
		wallet: '0 APE',
	},
];

const marketsSupplyTableData: TableData<MarketsSupplyTableData>[] = [
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

const COLUMN_HEIGHT = '64px';
const COLUMN_WIDTH = '120px';

export const MarketsSupplyTable: FC = () => {
	return (
		<div className={css.container}>
			<p className={css.label}>Supply Markets</p>

			<Table<MarketsSupplyTableColumn, MarketsSupplyTableData>
				data={yourMarketsSupplyTableData}
				columns={marketsSupplyTableColumns}
				columnHeight={COLUMN_HEIGHT}
				columnWidth={COLUMN_WIDTH}
				theme={tableCss}
			/>

			<div className={css.delimiter} />

			<Table<MarketsSupplyTableColumn, MarketsSupplyTableData>
				data={marketsSupplyTableData}
				columns={marketsSupplyTableColumns}
				columnHeight={COLUMN_HEIGHT}
				columnWidth={COLUMN_WIDTH}
				theme={tableCss}
			/>
		</div>
	);
};
