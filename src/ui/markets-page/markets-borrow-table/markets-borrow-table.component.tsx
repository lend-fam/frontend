import { type FC } from 'react';
import { Table, type TableColumnProps, type TableData } from '../../../ui-kit/components/table/table.component';
import { AssetsColumn } from '../../../ui-kit/components/table/columns/assets-column/assets-column.component';

import css from './markets-borrow-table.module.css';
import tableCss from './theme/table.module.css';

type MarketsBorrowTableData = {
	assets: string;
	apy: string;
    xp: string;
	unknown1: string;
	unknown2: string;
};

type MarketsBorrowTableColumn = 'assets' | 'apy' | 'xp' | 'unknown1' | 'unknown2';

const marketsBorrowTableColumns: TableColumnProps<MarketsBorrowTableData, MarketsBorrowTableColumn>[] = [
	{ key: 'assets', label: 'Asset', width: '212px', cellRenderer: AssetsColumn },
	{ key: 'apy', label: 'APY', align: 'right' },
	{ key: 'xp', label: 'XP', align: 'right', width: '74px' },
	{ key: 'unknown1', label: '?', align: 'right', width: '114px' },
	{ key: 'unknown2', label: '?', align: 'right', width: '120px' },
];

const yourMarketsBorrowTableData: TableData<MarketsBorrowTableData>[] = [];

const marketsBorrowTableData: TableData<MarketsBorrowTableData>[] = [
	{
		assets: 'ApeCoin',
		apy: '3.41%',
		xp: '0.23%',
		unknown1: '3.41%',
		unknown2: '$21.68M',
	},
	{
		assets: 'ApeCoin',
		apy: '3.41%',
		xp: '0.23%',
		unknown1: '3.41%',
		unknown2: '$21.68M',
	},
	{
		assets: 'ApeCoin',
		apy: '3.41%',
		xp: '0.23%',
		unknown1: '3.41%',
		unknown2: '$21.68M',
	},
];

const COLUMN_HEIGHT = '64px';
const COLUMN_WIDTH = '120px';

export const MarketsBorrowTable: FC = () => {
	return (
		<div className={css.container}>
			<p className={css.label}>Borrow Markets</p>

			{yourMarketsBorrowTableData.length > 0 && (
				<Table<MarketsBorrowTableColumn, MarketsBorrowTableData>
					data={yourMarketsBorrowTableData}
					columns={marketsBorrowTableColumns}
					columnHeight={COLUMN_HEIGHT}
					columnWidth={COLUMN_WIDTH}
					theme={tableCss}
				/>
			)}

			<div className={css.delimiter} />

			{marketsBorrowTableData.length > 0 && (
				<Table<MarketsBorrowTableColumn, MarketsBorrowTableData>
					data={marketsBorrowTableData}
					columns={marketsBorrowTableColumns}
					columnHeight={COLUMN_HEIGHT}
					columnWidth={COLUMN_WIDTH}
					theme={tableCss}
				/>
			)}
		</div>
	);
};
