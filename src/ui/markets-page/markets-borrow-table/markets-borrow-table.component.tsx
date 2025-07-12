import { type FC, useMemo } from 'react';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { Table, type TableColumnProps, type TableData } from '../../../ui-kit/components/table/table.component';
import { AssetsColumn } from '../../../ui-kit/components/table/columns/assets-column/assets-column.component';
import { useAllMarkets, useUserMarkets, useMarketsAPY } from '../../../hooks/use-markets.hook';
import { TokenService } from '../../../services/token.service';

import css from './markets-borrow-table.module.css';
import tableCss from './theme/table.module.css';

type MarketsBorrowTableData = {
	assets: string;
	apy: string;
	xp: string;
	borrowed: string;
	liquidity: string;
};

type MarketsBorrowTableColumn = 'assets' | 'apy' | 'xp' | 'borrowed' | 'liquidity';

const marketsBorrowTableColumns: TableColumnProps<MarketsBorrowTableData, MarketsBorrowTableColumn>[] = [
	{ key: 'assets', label: 'Asset', width: '212px', cellRenderer: AssetsColumn },
	{ key: 'apy', label: 'APY', align: 'right' },
	{ key: 'xp', label: 'XP', align: 'right', width: '74px' },
	{ key: 'borrowed', label: 'Borrowed', align: 'right', width: '114px' },
	{ key: 'liquidity', label: 'Liquidity', align: 'right', width: '120px' },
];

const COLUMN_HEIGHT = '64px';
const COLUMN_WIDTH = '120px';

export const MarketsBorrowTable: FC = () => {
	const { address: userAddress } = useAccount();
	const { data: allMarkets, isLoading: marketsLoading } = useAllMarkets();
	const { data: userMarkets } = useUserMarkets(userAddress);
	const { data: marketsAPY, isLoading: apyLoading } = useMarketsAPY();

	const marketsBorrowTableData: TableData<MarketsBorrowTableData>[] = useMemo(() => {
		if (!allMarkets || marketsLoading || apyLoading) {
			return [];
		}

		const tableData: TableData<MarketsBorrowTableData>[] = [];

		for (let i = 0; i < allMarkets.length; i++) {
			const marketAddress = allMarkets[i];
			const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress);
			const apyData = marketsAPY?.[marketAddress];
			const apy = apyData?.borrowAPY || '0.00';

			tableData.push({
				assets: displayName,
				apy: `${apy}%`,
				xp: '0.23%',
				borrowed: '0',
				liquidity: '$21.68M',
			});
		}

		return tableData;
	}, [allMarkets, marketsLoading, apyLoading, marketsAPY]);

	const yourMarketsBorrowTableData: TableData<MarketsBorrowTableData>[] = useMemo(() => {
		if (!userAddress || !userMarkets) {
			return [];
		}

		return userMarkets
			.filter(() => false)
			.map((marketAddress: Address) => ({
				assets: `Market ${marketAddress.slice(0, 6)}...`,
				apy: '5.23%',
				xp: '0.23%',
				borrowed: '0',
				liquidity: '$21.68M',
			}));
	}, [userAddress, userMarkets]);

	if (marketsLoading || apyLoading || !allMarkets) {
		return (
			<div className={css.container}>
				<p className={css.label}>Borrow Markets</p>
				<div>Fetching markets from blockchain...</div>
			</div>
		);
	}

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
