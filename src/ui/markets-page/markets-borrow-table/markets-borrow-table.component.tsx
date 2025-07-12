import { type FC, useMemo } from 'react';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { Table, type TableColumnProps, type TableData } from '../../../ui-kit/components/table/table.component';
import { AssetsColumn } from '../../../ui-kit/components/table/columns/assets-column/assets-column.component';
import { BalanceColumn } from '../../../ui-kit/components/table/columns/balance-column/balance-column.component';
import { BorrowActionButtons } from '../../../ui-kit/components/table/columns/borrow-action-buttons/borrow-action-buttons.component';
import {
	useAllMarkets,
	useMarketsAPY,
	useUserBorrowPositions,
	useMarketsAvailableLiquidity,
} from '../../../hooks/use-markets.hook';
import { useUSDBalances } from '../../../hooks/use-usd-balances.hook';
import { TokenService } from '../../../services/token.service';
import { MarketService } from '../../../services/market.service';

import css from './markets-borrow-table.module.css';
import tableCss from './theme/table.module.css';

type MarketsBorrowTableData = {
	assets: string;
	available: string;
	apy: string;
	actions: string;
	// Additional data for rendering
	marketAddress: Address;
	availableAmount: string;
	usdValue: string;
	symbol: string;
	hasBorrowed: boolean;
	borrowAPY: string;
	availableLiquidity: bigint;
};

type MarketsBorrowTableColumn = 'assets' | 'available' | 'apy' | 'actions';

// Column definitions for borrowed assets
const borrowedAssetsColumns: TableColumnProps<MarketsBorrowTableData, MarketsBorrowTableColumn>[] = [
	{ key: 'assets', label: 'Asset', width: '20%', cellRenderer: AssetsColumn },
	{
		key: 'available',
		label: 'Borrowed',
		align: 'right',
		width: '20%',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					padding: '0 12px',
				}}>
				<BalanceColumn tokenAmount={data.availableAmount} usdValue={data.usdValue} symbol={data.symbol} />
			</div>
		),
	},
	{ key: 'apy', label: 'APY', align: 'right', width: '30%' },
	{
		key: 'actions',
		label: 'Actions',
		align: 'right',
		width: '30%',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					padding: '0 12px',
					height: '100%',
				}}>
				<BorrowActionButtons
					marketAddress={data.marketAddress}
					hasBorrowed={data.hasBorrowed}
					tokenSymbol={data.symbol}
					borrowAPY={data.borrowAPY}
					availableLiquidity={data.availableLiquidity}
				/>
			</div>
		),
	},
];

// Column definitions for available assets to borrow
const availableAssetsColumns: TableColumnProps<MarketsBorrowTableData, MarketsBorrowTableColumn>[] = [
	{ key: 'assets', label: 'Asset', width: '20%', cellRenderer: AssetsColumn },
	{
		key: 'available',
		label: 'Available',
		align: 'right',
		width: '20%',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					padding: '0 12px',
				}}>
				<BalanceColumn tokenAmount={data.availableAmount} usdValue={data.usdValue} symbol={data.symbol} />
			</div>
		),
	},
	{ key: 'apy', label: 'APY, variable', align: 'right', width: '30%' },
	{
		key: 'actions',
		label: 'Actions',
		align: 'right',
		width: '30%',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					padding: '0 12px',
					height: '100%',
				}}>
				<BorrowActionButtons
					marketAddress={data.marketAddress}
					hasBorrowed={data.hasBorrowed}
					tokenSymbol={data.symbol}
					borrowAPY={data.borrowAPY}
					availableLiquidity={data.availableLiquidity}
				/>
			</div>
		),
	},
];

const COLUMN_HEIGHT = '64px';
const COLUMN_WIDTH = '120px';

export const MarketsBorrowTable: FC = () => {
	const { address: userAddress } = useAccount();
	const { data: allMarkets, isLoading: marketsLoading } = useAllMarkets();
	const { data: marketsAPY, isLoading: apyLoading } = useMarketsAPY();
	const { data: userBorrowPositions, isLoading: positionsLoading } = useUserBorrowPositions(userAddress);
	const { data: availableLiquidity, isLoading: liquidityLoading } = useMarketsAvailableLiquidity();

	// Prepare balance data for USD conversion
	const balanceData = useMemo(() => {
		if (!allMarkets || !userBorrowPositions || !availableLiquidity) return [];

		const balances: Array<{ marketAddress: Address; balance: bigint; symbol: string; decimals: number }> = [];

		allMarkets.forEach((marketAddress) => {
			const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress);
			const symbol = displayName.replace('Market ', '').split(' ')[0];
			const userPosition = userBorrowPositions[marketAddress];
			const hasBorrowed = userPosition?.hasBorrowed || false;

			if (hasBorrowed && userPosition?.balance && userPosition.balance > 0n) {
				// Add borrowed balance for USD conversion
				balances.push({
					marketAddress,
					balance: userPosition.balance,
					symbol,
					decimals: 18,
				});
			} else {
				// Add available liquidity for USD conversion
				const availableCash = availableLiquidity[marketAddress] || 0n;
				if (availableCash > 0n) {
					balances.push({
						marketAddress,
						balance: availableCash,
						symbol,
						decimals: 18,
					});
				}
			}
		});

		return balances;
	}, [allMarkets, userBorrowPositions, availableLiquidity]);

	// Fetch USD values for balances
	const { data: usdBalances, isLoading: usdLoading } = useUSDBalances(balanceData);

	const { borrowedMarketsData, availableMarketsData } = useMemo(() => {
		if (!allMarkets || marketsLoading || apyLoading || liquidityLoading || usdLoading) {
			return { borrowedMarketsData: [], availableMarketsData: [] };
		}

		const borrowed: TableData<MarketsBorrowTableData>[] = [];
		const available: TableData<MarketsBorrowTableData>[] = [];

		for (let i = 0; i < allMarkets.length; i++) {
			const marketAddress = allMarkets[i];
			const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress);
			const apyData = marketsAPY?.[marketAddress];
			const apy = apyData?.borrowAPY || '0.00';
			const userPosition = userBorrowPositions?.[marketAddress];
			const hasBorrowed = userPosition?.hasBorrowed || false;

			// Get real available liquidity from contract
			const availableCash = availableLiquidity?.[marketAddress] || 0n;
			const availableAmount = hasBorrowed
				? MarketService.formatTokenBalance(userPosition?.balance || 0n, 18)
				: MarketService.formatTokenBalance(availableCash, 18);
			const usdValue = usdBalances?.[marketAddress] || '0';

			// Get symbol from display name
			const symbol = displayName.replace('Market ', '').split(' ')[0];

			const marketData: MarketsBorrowTableData = {
				assets: displayName,
				available: availableAmount,
				apy: `${apy}%`,
				actions: '', // Will be handled by cellRenderer
				// Additional data for rendering
				marketAddress,
				availableAmount,
				usdValue,
				symbol,
				hasBorrowed,
				borrowAPY: `${apy}%`,
				availableLiquidity: availableCash,
			};

			if (hasBorrowed) {
				borrowed.push(marketData);
			} else {
				available.push(marketData);
			}
		}

		return {
			borrowedMarketsData: borrowed,
			availableMarketsData: available,
		};
	}, [
		allMarkets,
		marketsLoading,
		apyLoading,
		liquidityLoading,
		usdLoading,
		marketsAPY,
		userBorrowPositions,
		availableLiquidity,
		usdBalances,
	]);

	if (marketsLoading || apyLoading || positionsLoading || liquidityLoading || usdLoading || !allMarkets) {
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

			{borrowedMarketsData.length > 0 ? (
				<>
					<p className={css.sectionHeader}>Your borrows</p>
					<Table
						data={borrowedMarketsData}
						columns={borrowedAssetsColumns}
						columnHeight={COLUMN_HEIGHT}
						columnWidth={COLUMN_WIDTH}
						theme={tableCss}
					/>
				</>
			) : (
				<>
					<p className={css.sectionHeader}>Your borrows</p>
					<div className={css.emptyState}>Nothing borrowed yet</div>
				</>
			)}

			{borrowedMarketsData.length > 0 && availableMarketsData.length > 0 && <div className={css.delimiter} />}

			{availableMarketsData.length > 0 && (
				<>
					<p className={css.sectionHeader}>Assets to borrow</p>
					<Table
						data={availableMarketsData}
						columns={availableAssetsColumns}
						columnHeight={COLUMN_HEIGHT}
						columnWidth={COLUMN_WIDTH}
						theme={tableCss}
					/>
				</>
			)}
		</div>
	);
};
