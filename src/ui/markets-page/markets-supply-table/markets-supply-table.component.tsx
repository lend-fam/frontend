import { type FC, useMemo } from 'react';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { Table, type TableColumnProps, type TableData } from '../../../ui-kit/components/table/table.component';
import { AssetsColumn } from '../../../ui-kit/components/table/columns/assets-column/assets-column.component';
import { CollateralColumn } from '../../../ui-kit/components/table/columns/collateral-column/collateral-column.component';
import { useAllMarkets, useUserMarkets, useMarketsAPY } from '../../../hooks/use-markets.hook';
import { MarketService } from '../../../services/market.service';
import { TokenService } from '../../../services/token.service';

import css from './markets-supply-table.module.css';
import tableCss from './theme/table.module.css';

type MarketsSupplyTableData = {
	assets: string;
	apy: string;
	wallet: string;
	collateral: string;
};

type MarketsSupplyTableColumn = 'assets' | 'apy' | 'wallet' | 'collateral';

const marketsSupplyTableColumns: TableColumnProps<MarketsSupplyTableData, MarketsSupplyTableColumn>[] = [
	{ key: 'assets', label: 'Asset', width: '196px', cellRenderer: AssetsColumn },
	{ key: 'apy', label: 'APY', align: 'right' },
	{ key: 'wallet', label: 'Wallet', align: 'right' },
	{ key: 'collateral', label: 'Collateral', width: '184px', align: 'center', cellRenderer: CollateralColumn },
];

const COLUMN_HEIGHT = '64px';
const COLUMN_WIDTH = '120px';

export const MarketsSupplyTable: FC = () => {
	const { address: userAddress } = useAccount();
	const { data: allMarkets, isLoading: marketsLoading } = useAllMarkets();
	const { data: userMarkets } = useUserMarkets(userAddress);
	const { data: marketsAPY, isLoading: apyLoading } = useMarketsAPY();

	const marketsSupplyTableData: TableData<MarketsSupplyTableData>[] = useMemo(() => {
		if (!allMarkets || marketsLoading || apyLoading) {
			return [];
		}

		const tableData: TableData<MarketsSupplyTableData>[] = [];

		for (let i = 0; i < allMarkets.length; i++) {
			const marketAddress = allMarkets[i];
			const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress);
			const apyData = marketsAPY?.[marketAddress];
			const apy = apyData?.supplyAPY || '0.00';

			tableData.push({
				assets: displayName,
				apy: `${apy}%`,
				wallet: '0',
				collateral: 'enabled',
			});
		}

		return tableData;
	}, [allMarkets, marketsLoading, apyLoading, marketsAPY]);

	const yourMarketsSupplyTableData: TableData<MarketsSupplyTableData>[] = useMemo(() => {
		if (!userAddress || !userMarkets) {
			return [];
		}

		return userMarkets.map((marketAddress: Address) => ({
			assets: `Market ${marketAddress.slice(0, 6)}...`,
			apy: '3.41%',
			wallet: '0',
			collateral: 'enabled',
		}));
	}, [userAddress, userMarkets]);

	if (marketsLoading || apyLoading || !allMarkets) {
		return (
			<div className={css.container}>
				<p className={css.label}>Supply Markets</p>
				<div>Fetching markets from blockchain...</div>
			</div>
		);
	}

	return (
		<div className={css.container}>
			<p className={css.label}>Supply Markets</p>

			{yourMarketsSupplyTableData.length > 0 && (
				<Table
					data={yourMarketsSupplyTableData}
					columns={marketsSupplyTableColumns}
					columnHeight={COLUMN_HEIGHT}
					columnWidth={COLUMN_WIDTH}
					theme={tableCss}
				/>
			)}

			<div className={css.delimiter} />

			{marketsSupplyTableData.length > 0 && (
				<Table
					data={marketsSupplyTableData}
					columns={marketsSupplyTableColumns}
					columnHeight={COLUMN_HEIGHT}
					columnWidth={COLUMN_WIDTH}
					theme={tableCss}
				/>
			)}
		</div>
	);
};
