import { type FC, type ComponentType, useMemo, memo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Address } from 'viem';
import {
	Table,
	type TableColumnProps,
	type TableData,
	type SortState,
	type TableHeadColumnRendererProps,
} from '../../../ui-kit/components/table/table.component';
import { createSortableColumnRenderer } from '../../../ui-kit/components/table/sortable-table-column.component';
import { AssetsColumn } from '../../../ui-kit/components/table/columns/assets-column/assets-column.component';
import { BalanceColumn } from '../../../ui-kit/components/table/columns/balance-column/balance-column.component';
import { Button } from '../../../ui-kit/components/button/button.component';
import { NativeYieldBadge } from '../../../ui-kit/components/native-yield-badge/native-yield-badge.component';
import { useAllMarkets, useMarketTotals, useUSDBalances } from '../../../hooks';
import { useMarketsDataOptimized } from '../../../hooks/use-market-data-optimized.hook';
import { useNativeYield } from '../../../hooks/use-native-yield.hook';
import { useTokenMetadata } from '../../../hooks/use-token-metadata.hook';
import { TokenService, MarketService } from '../../../services';
import { useMarketsAPY } from '../../../hooks/use-market-data.hook';

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
	nativeYieldAPY?: string;
	hasNativeYield?: boolean;
	totalSuppliedUSDValue: number;
	totalBorrowedUSDValue: number;
};

type UnifiedMarketsTableColumn = 'assets' | 'totalSupplied' | 'supplyAPY' | 'totalBorrowed' | 'borrowAPY' | 'details';

const createUnifiedMarketsColumns = (
	navigate: (path: string) => void,
): TableColumnProps<UnifiedMarketsTableData, UnifiedMarketsTableColumn>[] => [
	{
		key: 'assets',
		label: 'Asset',
		width: '20%',
		sortable: true,
		headCellRenderer: createSortableColumnRenderer('assets' as const, 'Asset') as ComponentType<
			TableHeadColumnRendererProps<UnifiedMarketsTableColumn>
		>,
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
		sortable: true,
		headCellRenderer: createSortableColumnRenderer('totalSupplied' as const, 'Total supplied') as ComponentType<
			TableHeadColumnRendererProps<UnifiedMarketsTableColumn>
		>,
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
		sortable: true,
		headCellRenderer: createSortableColumnRenderer('supplyAPY' as const, 'Supply APY') as ComponentType<
			TableHeadColumnRendererProps<UnifiedMarketsTableColumn>
		>,
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-end',
					justifyContent: 'center',
					padding: '0 12px',
					gap: '2px',
				}}>
				<div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: '500', color: '#18171E' }}>
					{data.supplyAPY}
				</div>
				{data.hasNativeYield && data.nativeYieldAPY && <NativeYieldBadge apy={data.nativeYieldAPY} />}
			</div>
		),
	},
	{
		key: 'totalBorrowed',
		label: 'Total borrowed',
		align: 'right',
		width: '16%',
		sortable: true,
		headCellRenderer: createSortableColumnRenderer('totalBorrowed' as const, 'Total borrowed') as ComponentType<
			TableHeadColumnRendererProps<UnifiedMarketsTableColumn>
		>,
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
		label: 'Borrow APY',
		align: 'right',
		width: '16%',
		sortable: true,
		headCellRenderer: createSortableColumnRenderer('borrowAPY' as const, 'Borrow APY') as ComponentType<
			TableHeadColumnRendererProps<UnifiedMarketsTableColumn>
		>,
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
				<Button variant="ghost" size="medium" onClick={() => navigate(`/markets/${data.marketAddress}`)}>
					Details
				</Button>
			</div>
		),
	},
];

const UnifiedMarketsTableComponent: FC = () => {
	const navigate = useNavigate();
	const { data: allMarkets, isLoading: marketsLoading } = useAllMarkets();
	const { data: optimizedMarketData, isLoading: optimizedDataLoading } = useMarketsDataOptimized();
	const { data: marketTotals, isLoading: totalsLoading } = useMarketTotals();
	const { data: nativeYieldData } = useNativeYield();
	const { data: legacyAPYData, isLoading: legacyAPYLoading } = useMarketsAPY();

	const [sortState, setSortState] = useState<SortState<UnifiedMarketsTableColumn>>({
		column: null,
		direction: null,
	});

	const handleSort = useCallback((column: UnifiedMarketsTableColumn) => {
		setSortState((prev) => {
			if (prev.column === column) {
				const nextDirection = prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc';
				return {
					column: nextDirection === null ? null : column,
					direction: nextDirection,
				};
			}
			return { column, direction: 'asc' };
		});
	}, []);

	const { data: tokenMetadata, isLoading: tokenMetadataLoading } = useTokenMetadata((allMarkets as Address[]) || []);

	const totalSuppliedBalanceData = useMemo(() => {
		if (!allMarkets || !marketTotals) return [];

		return allMarkets.map((marketAddress) => {
			const marketTotalsData = marketTotals[marketAddress];
			const metadata = tokenMetadata?.[marketAddress];
			const symbol = TokenService.formatMarketName(undefined, undefined, marketAddress, metadata);
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
			const symbol = TokenService.formatMarketName(undefined, undefined, marketAddress, metadata);

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
		if (
			!allMarkets ||
			marketsLoading ||
			optimizedDataLoading ||
			totalsLoading ||
			suppliedUSDLoading ||
			borrowedUSDLoading ||
			!tokenMetadata
		) {
			return [];
		}

		const markets: TableData<UnifiedMarketsTableData>[] = [];

		for (let i = 0; i < allMarkets.length; i++) {
			const marketAddress = allMarkets[i];
			const metadata = tokenMetadata?.[marketAddress];
			const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress, metadata);
			const symbol = TokenService.formatMarketName(undefined, undefined, marketAddress, metadata);

			const apyData = optimizedMarketData?.apyData?.[marketAddress] || legacyAPYData?.[marketAddress];
			const supplyAPY = apyData?.supplyAPY || '0.00';
			const borrowAPY = apyData?.borrowAPY || '0.00';

			const marketTotalsData = marketTotals?.[marketAddress];

			const totalSupplyCTokens = marketTotalsData?.totalSupply || 0n;
			const exchangeRate = marketTotalsData?.exchangeRate || 0n;
			const decimals = metadata?.underlyingDecimals ?? 18;
			const totalSuppliedBalance = exchangeRate > 0n ? (totalSupplyCTokens * exchangeRate) / 10n ** 18n : 0n;
			const totalSuppliedAmount = MarketService.formatTokenBalance(totalSuppliedBalance, decimals);
			const totalSuppliedUSD = suppliedUSDBalances?.[marketAddress] || '0';
			const totalSuppliedUSDValue = parseFloat(totalSuppliedUSD);

			const totalBorrowedBalance = marketTotalsData?.totalBorrows || 0n;
			const totalBorrowedAmount = MarketService.formatTokenBalance(totalBorrowedBalance, decimals);
			const totalBorrowedUSD = borrowedUSDBalances?.[marketAddress] || '0';
			const totalBorrowedUSDValue = parseFloat(totalBorrowedUSD);

			// Native yield logic for APE tokens
			const isAPEToken = symbol === 'APE' || symbol === 'Ape';
			const hasNativeYield = isAPEToken && nativeYieldData?.apy && parseFloat(nativeYieldData.apy) > 0;
			const nativeYieldAPY = hasNativeYield ? `${nativeYieldData?.apy}%` : undefined;

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
				nativeYieldAPY,
				hasNativeYield: !!hasNativeYield,
				totalSuppliedUSDValue,
				totalBorrowedUSDValue,
			};

			markets.push(marketData);
		}

		return markets;
	}, [
		allMarkets,
		marketsLoading,
		optimizedDataLoading,
		totalsLoading,
		suppliedUSDLoading,
		borrowedUSDLoading,
		optimizedMarketData,
		marketTotals,
		suppliedUSDBalances,
		borrowedUSDBalances,
		tokenMetadata,
		nativeYieldData,
		legacyAPYData,
	]);

	const sortedMarketsData = useMemo(() => {
		if (!marketsData || !sortState.column || !sortState.direction) {
			return marketsData;
		}

		return [...marketsData].sort((a, b) => {
			let aValue: string | number;
			let bValue: string | number;

			switch (sortState.column) {
				case 'assets':
					aValue = a.symbol.toLowerCase();
					bValue = b.symbol.toLowerCase();
					break;
				case 'totalSupplied':
					aValue = a.totalSuppliedUSDValue;
					bValue = b.totalSuppliedUSDValue;
					break;
				case 'supplyAPY':
					aValue = parseFloat(a.supplyAPYValue);
					bValue = parseFloat(b.supplyAPYValue);
					break;
				case 'totalBorrowed':
					aValue = a.totalBorrowedUSDValue;
					bValue = b.totalBorrowedUSDValue;
					break;
				case 'borrowAPY':
					aValue = parseFloat(a.borrowAPYValue);
					bValue = parseFloat(b.borrowAPYValue);
					break;
				default:
					return 0;
			}

			if (typeof aValue === 'string' && typeof bValue === 'string') {
				return sortState.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
			}

			if (typeof aValue === 'number' && typeof bValue === 'number') {
				return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue;
			}

			return 0;
		});
	}, [marketsData, sortState]);

	if (
		marketsLoading ||
		optimizedDataLoading ||
		totalsLoading ||
		suppliedUSDLoading ||
		borrowedUSDLoading ||
		tokenMetadataLoading ||
		legacyAPYLoading ||
		!allMarkets
	) {
		return (
			<div className={css.container}>
				<p className={css.label}>All Markets</p>
				<div className={css.loadingSkeleton}>
					{[...Array(5)].map((_, i) => (
						<div key={i} className={css.skeletonRow}>
							<div className={css.skeletonCell}></div>
							<div className={css.skeletonCell}></div>
							<div className={css.skeletonCell}></div>
							<div className={css.skeletonCell}></div>
							<div className={css.skeletonCell}></div>
							<div className={css.skeletonCell}></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className={css.container}>
			<p className={css.label}>All Markets</p>
			<Table
				data={sortedMarketsData}
				columns={unifiedMarketsColumns}
				columnHeight="72px"
				columnWidth="120px"
				theme={tableCss}
				sortState={sortState}
				onSort={handleSort}
			/>
		</div>
	);
};

export const UnifiedMarketsTable = memo(UnifiedMarketsTableComponent);
