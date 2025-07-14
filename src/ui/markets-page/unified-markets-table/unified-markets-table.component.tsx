import { type FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Address } from 'viem';
import { Table, type TableColumnProps, type TableData } from '../../../ui-kit/components/table/table.component';
import { AssetsColumn } from '../../../ui-kit/components/table/columns/assets-column/assets-column.component';
import { BalanceColumn } from '../../../ui-kit/components/table/columns/balance-column/balance-column.component';
import { Button } from '../../../ui-kit/components/button/button.component';
import { useAllMarkets, useMarketsAPY, useMarketTotals, useUSDBalances } from '../../../hooks';
import { useTokenMetadata } from '../../../hooks/use-token-metadata.hook';
import { TokenService, MarketService } from '../../../services';

import css from './unified-markets-table.module.css';
import tableCss from './theme/table.module.css';

type UnifiedMarketsTableData = {
	assets: string;
	totalSupplied: string;
	supplyAPY: string;
	totalBorrowed: string;
	borrowAPY: string;
	details: string;
	marketAddress: Address;
	totalSuppliedAmount: string;
	totalSuppliedUSD: string;
	totalBorrowedAmount: string;
	totalBorrowedUSD: string;
	symbol: string;
	supplyAPYValue: string;
	borrowAPYValue: string;
};

type UnifiedMarketsTableColumn = 'assets' | 'totalSupplied' | 'supplyAPY' | 'totalBorrowed' | 'borrowAPY' | 'details';

const createUnifiedMarketsColumns = (
	navigate: (path: string) => void,
): TableColumnProps<UnifiedMarketsTableData, UnifiedMarketsTableColumn>[] => [
	{
		key: 'assets',
		label: 'Asset',
		width: '20%',
		cellRenderer: ({ data, ...props }) => (
			<AssetsColumn
				{...props}
				data={data}
				onClick={() => navigate(`/markets/${data.marketAddress}`)}
				style={{ ...props.style, cursor: 'pointer' }}
			/>
		),
	},
	{
		key: 'totalSupplied',
		label: 'Total supplied',
		align: 'right',
		width: '16%',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					padding: '0 12px',
				}}>
				<BalanceColumn
					tokenAmount={data.totalSuppliedAmount}
					usdValue={data.totalSuppliedUSD}
					symbol={data.symbol}
				/>
			</div>
		),
	},
	{
		key: 'supplyAPY',
		label: 'Supply APY',
		align: 'right',
		width: '12%',
	},
	{
		key: 'totalBorrowed',
		label: 'Total borrowed',
		align: 'right',
		width: '16%',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					padding: '0 12px',
				}}>
				<BalanceColumn
					tokenAmount={data.totalBorrowedAmount}
					usdValue={data.totalBorrowedUSD}
					symbol={data.symbol}
				/>
			</div>
		),
	},
	{
		key: 'borrowAPY',
		label: 'Borrow APY, variable',
		align: 'right',
		width: '16%',
	},
	{
		key: 'details',
		label: '',
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
					height: '100%',
				}}>
				<Button className={css.detailsButton} onClick={() => navigate(`/markets/${data.marketAddress}`)}>
					Details
				</Button>
			</div>
		),
	},
];

export const UnifiedMarketsTable: FC = () => {
	const navigate = useNavigate();
	const { data: allMarkets, isLoading: marketsLoading } = useAllMarkets();
	const { data: marketsAPY, isLoading: apyLoading } = useMarketsAPY();
	const { data: marketTotals, isLoading: totalsLoading } = useMarketTotals();

	const { data: tokenMetadata, isLoading: tokenMetadataLoading } = useTokenMetadata(
		(allMarkets as Address[]) || [],
	);

	const totalSuppliedBalanceData = useMemo(() => {
		if (!allMarkets || !marketTotals) return [];

		return allMarkets.map((marketAddress) => {
			const marketTotalsData = marketTotals[marketAddress];
			const metadata = tokenMetadata?.[marketAddress];
			const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress, metadata);
			const symbol = metadata?.underlyingSymbol || displayName.replace('Market ', '').split(' ')[0];
			const decimals = metadata?.underlyingDecimals ?? 18;

			const totalSupplyCTokens = marketTotalsData?.totalSupply || 0n;
			const exchangeRate = marketTotalsData?.exchangeRate || 0n;

			const totalSuppliedUnderlying = exchangeRate > 0n ? (totalSupplyCTokens * exchangeRate) / 10n ** 18n : 0n;

			return {
				marketAddress: marketAddress as Address,
				balance: totalSuppliedUnderlying,
				symbol,
				decimals,
			};
		});
	}, [allMarkets, marketTotals, tokenMetadata]);

	const totalBorrowedBalanceData = useMemo(() => {
		if (!allMarkets || !marketTotals) return [];

		return allMarkets.map((marketAddress) => {
			const marketTotalsData = marketTotals[marketAddress];
			const metadata = tokenMetadata?.[marketAddress];
			const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress, metadata);
			const symbol = metadata?.underlyingSymbol || displayName.replace('Market ', '').split(' ')[0];

			const totalBorrowed = marketTotalsData?.totalBorrows || 0n;

			return {
				marketAddress: marketAddress as Address,
				balance: totalBorrowed,
				symbol,
				decimals: 18,
			};
		});
	}, [allMarkets, marketTotals, tokenMetadata]);

	const { data: suppliedUSDBalances, isLoading: suppliedUSDLoading } = useUSDBalances(totalSuppliedBalanceData);
	const { data: borrowedUSDBalances, isLoading: borrowedUSDLoading } = useUSDBalances(totalBorrowedBalanceData);

	const unifiedMarketsColumns = useMemo(() => createUnifiedMarketsColumns(navigate), [navigate]);

	const marketsData = useMemo(() => {
		if (!allMarkets || marketsLoading || apyLoading || totalsLoading || suppliedUSDLoading || borrowedUSDLoading) {
			return [];
		}

		const markets: TableData<UnifiedMarketsTableData>[] = [];

		for (let i = 0; i < allMarkets.length; i++) {
			const marketAddress = allMarkets[i];
			const metadata = tokenMetadata?.[marketAddress];
			const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress, metadata);
			const symbol = metadata?.underlyingSymbol || displayName.replace('Market ', '').split(' ')[0];

			const apyData = marketsAPY?.[marketAddress];
			const supplyAPY = apyData?.supplyAPY || '0.00';
			const borrowAPY = apyData?.borrowAPY || '0.00';

			const marketTotalsData = marketTotals?.[marketAddress];

			const totalSupplyCTokens = marketTotalsData?.totalSupply || 0n;
			const exchangeRate = marketTotalsData?.exchangeRate || 0n;
			const decimals = metadata?.underlyingDecimals ?? 18;
			const totalSuppliedBalance = exchangeRate > 0n ? (totalSupplyCTokens * exchangeRate) / 10n ** 18n : 0n;
			const totalSuppliedAmount = MarketService.formatTokenBalance(totalSuppliedBalance, decimals);
			const totalSuppliedUSD = suppliedUSDBalances?.[marketAddress] || '0';

			const totalBorrowedBalance = marketTotalsData?.totalBorrows || 0n;
			const totalBorrowedAmount = MarketService.formatTokenBalance(totalBorrowedBalance, decimals);
			const totalBorrowedUSD = borrowedUSDBalances?.[marketAddress] || '0';

			const marketData: UnifiedMarketsTableData = {
				assets: displayName,
				totalSupplied: `${totalSuppliedAmount} ${symbol}`,
				supplyAPY: `${supplyAPY}%`,
				totalBorrowed: `${totalBorrowedAmount} ${symbol}`,
				borrowAPY: `${borrowAPY}%`,
				details: 'Details',
				marketAddress,
				totalSuppliedAmount,
				totalSuppliedUSD,
				totalBorrowedAmount,
				totalBorrowedUSD,
				symbol,
				supplyAPYValue: supplyAPY,
				borrowAPYValue: borrowAPY,
			};

			markets.push(marketData);
		}

		return markets;
	}, [
		allMarkets,
		marketsLoading,
		apyLoading,
		totalsLoading,
		marketsAPY,
		marketTotals,
		suppliedUSDBalances,
		borrowedUSDBalances,
		suppliedUSDLoading,
		borrowedUSDLoading,
		tokenMetadata,
	]);

	if (marketsLoading || apyLoading || totalsLoading || suppliedUSDLoading || borrowedUSDLoading || tokenMetadataLoading || !allMarkets) {
		return (
			<div className={css.container}>
				<div>Fetching markets from blockchain...</div>
			</div>
		);
	}

	return (
		<div className={css.container}>
			<p className={css.label}>All Markets</p>
			<Table
				data={marketsData}
				columns={unifiedMarketsColumns}
				columnHeight="72px"
				columnWidth="120px"
				theme={tableCss}
			/>
		</div>
	);
};
