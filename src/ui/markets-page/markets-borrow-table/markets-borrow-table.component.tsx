import { type FC, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import type { Address } from 'viem';
import {
	Table,
	type TableData,
	type TableColumnProps,
	type TableColumnRendererProps,
	AssetsColumn,
	BalanceColumn,
	BorrowActionButtons,
} from '../../../ui-kit';
import {
	useAllMarkets,
	useMarketsAPY,
	useUserBorrowPositions,
	useMarketsAvailableLiquidity,
	useUSDBalances,
	useAccountLiquidity,
} from '../../../hooks';
import { useTokenMetadata } from '../../../hooks/use-token-metadata.hook';
import { TokenService, MarketService } from '../../../services';

import css from './markets-borrow-table.module.css';
import tableCss from '../../../ui-kit/themes/market-table.module.css';

type MarketsBorrowTableData = {
	assets: string;
	available: string;
	apy: string;
	actions: string;
	marketAddress: Address;
	availableAmount: string;
	usdValue: string;
	symbol: string;
	hasBorrowed: boolean;
	borrowAPY: string;
	availableLiquidity: bigint;
	userBorrowCapacity: bigint;
};

type MarketsBorrowTableColumn = 'assets' | 'available' | 'apy' | 'actions';

const createBorrowedAssetsColumns = (
	navigate: (path: string) => void,
): TableColumnProps<MarketsBorrowTableData, MarketsBorrowTableColumn>[] => [
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
		key: 'available',
		label: 'Borrowed',
		align: 'right',
		width: '20%',
		cellRenderer: ({ data, style }: TableColumnRendererProps<MarketsBorrowTableData>) => (
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
	{
		key: 'apy',
		label: 'APY',
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
				}}>
				<div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: '500', color: '#18171E' }}>
					{data.apy}
				</div>
			</div>
		),
	},
	{
		key: 'actions',
		label: 'Actions',
		align: 'right',
		width: '30%',
		cellRenderer: ({ data, style }: TableColumnRendererProps<MarketsBorrowTableData>) => (
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

const createAvailableAssetsColumns = (
	navigate: (path: string) => void,
): TableColumnProps<MarketsBorrowTableData, MarketsBorrowTableColumn>[] => [
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
		key: 'available',
		label: 'Available',
		align: 'right',
		width: '20%',
		cellRenderer: ({ data, style }: TableColumnRendererProps<MarketsBorrowTableData>) => (
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
	{
		key: 'apy',
		label: 'APY, variable',
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
				}}>
				<div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: '500', color: '#18171E' }}>
					{data.apy}
				</div>
			</div>
		),
	},
	{
		key: 'actions',
		label: 'Actions',
		align: 'right',
		width: '30%',
		cellRenderer: ({ data, style }: TableColumnRendererProps<MarketsBorrowTableData>) => (
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

export const MarketsBorrowTable: FC = () => {
	const navigate = useNavigate();
	const { address: userAddress } = useAccount();
	const { data: allMarkets, isLoading: marketsLoading } = useAllMarkets();
	const { data: marketsAPY, isLoading: apyLoading } = useMarketsAPY();
	const { data: userBorrowPositions, isLoading: positionsLoading } = useUserBorrowPositions(userAddress);
	const { data: availableLiquidity, isLoading: liquidityLoading } = useMarketsAvailableLiquidity();
	const { data: accountLiquidity } = useAccountLiquidity(userAddress);

	const { data: tokenMetadata, isLoading: tokenMetadataLoading } = useTokenMetadata((allMarkets as Address[]) || []);

	const balanceData = useMemo(() => {
		if (!allMarkets || !userBorrowPositions || !availableLiquidity) return [];

		const balances: Array<{ marketAddress: Address; balance: bigint; symbol: string; decimals: number }> = [];

		allMarkets.forEach((marketAddress) => {
			const metadata = tokenMetadata?.[marketAddress];
			const symbol = TokenService.formatMarketName(undefined, undefined, marketAddress, metadata);
			const decimals = metadata?.underlyingDecimals ?? 18;
			const userPosition = userBorrowPositions[marketAddress];
			const hasBorrowed = userPosition?.hasBorrowed || false;

			if (hasBorrowed && userPosition?.balance && userPosition.balance > 0n) {
				balances.push({
					marketAddress,
					balance: userPosition.balance,
					symbol,
					decimals,
				});
			} else {
				const availableCash = availableLiquidity[marketAddress] || 0n;

				if (accountLiquidity && userAddress) {
					const [, liquidity] = accountLiquidity as [bigint, bigint, bigint];
					const userBorrowCapacity = liquidity && liquidity > 0n ? liquidity : 0n;
					const actualAvailable = userBorrowCapacity < availableCash ? userBorrowCapacity : availableCash;

					const displayAmount = actualAvailable > 0n ? actualAvailable : availableCash > 0n ? 0n : 0n;

					balances.push({
						marketAddress,
						balance: displayAmount,
						symbol,
						decimals,
					});
				} else {
					const maxDisplayAmount = 1000n * 10n ** BigInt(decimals);
					const displayAmount = availableCash < maxDisplayAmount ? availableCash : maxDisplayAmount;

					if (displayAmount > 0n) {
						balances.push({
							marketAddress,
							balance: displayAmount,
							symbol,
							decimals,
						});
					}
				}
			}
		});

		return balances;
	}, [allMarkets, userBorrowPositions, availableLiquidity, accountLiquidity, userAddress, tokenMetadata]);

	const { data: usdBalances, isLoading: usdLoading } = useUSDBalances(balanceData);

	const borrowedAssetsColumns = useMemo(() => createBorrowedAssetsColumns(navigate), [navigate]);
	const availableAssetsColumns = useMemo(() => createAvailableAssetsColumns(navigate), [navigate]);

	const userBorrowCapacity = accountLiquidity?.[1] || 0n;

	const { borrowedMarketsData, availableMarketsData } = useMemo(() => {
		if (!allMarkets || marketsLoading || apyLoading || liquidityLoading || usdLoading) {
			return { borrowedMarketsData: [], availableMarketsData: [] };
		}

		const borrowed: TableData<MarketsBorrowTableData>[] = [];
		const available: TableData<MarketsBorrowTableData>[] = [];

		for (let i = 0; i < allMarkets.length; i++) {
			const marketAddress = allMarkets[i];
			const metadata = tokenMetadata?.[marketAddress];
			const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress, metadata);
			const apyData = marketsAPY?.[marketAddress];
			const baseAPY = parseFloat(apyData?.borrowAPY || '0.00');
			const userPosition = userBorrowPositions?.[marketAddress];
			const hasBorrowed = userPosition?.hasBorrowed || false;

			const availableCash = availableLiquidity?.[marketAddress] || 0n;

			const decimals = metadata?.underlyingDecimals ?? 18;
			let availableAmount: string;
			if (hasBorrowed) {
				availableAmount = MarketService.formatTokenBalance(userPosition?.balance || 0n, decimals);
			} else {
				if (accountLiquidity && userAddress) {
					const [, liquidity] = accountLiquidity as [bigint, bigint, bigint];
					const userBorrowCapacity = liquidity && liquidity > 0n ? liquidity : 0n;
					const actualAvailable = userBorrowCapacity < availableCash ? userBorrowCapacity : availableCash;
					availableAmount = MarketService.formatTokenBalance(actualAvailable, decimals);
				} else {
					const maxDisplayAmount = 1000n * 10n ** BigInt(decimals);
					const displayAmount = availableCash < maxDisplayAmount ? availableCash : maxDisplayAmount;
					availableAmount = MarketService.formatTokenBalance(displayAmount, decimals);
				}
			}
			const usdValue = usdBalances?.[marketAddress] || '0';

			const symbol = metadata?.underlyingSymbol || displayName.replace('Market ', '').split(' ')[0];

			let userBorrowCapacity: bigint = 0n;
			if (accountLiquidity && userAddress) {
				const [, liquidity] = accountLiquidity as [bigint, bigint, bigint];
				userBorrowCapacity = liquidity && liquidity > 0n ? liquidity : 0n;
			}

			const marketData: MarketsBorrowTableData = {
				assets: displayName,
				available: availableAmount,
				apy: `${baseAPY.toFixed(2)}%`,
				actions: '',
				marketAddress,
				availableAmount,
				usdValue,
				symbol,
				hasBorrowed,
				borrowAPY: `${baseAPY.toFixed(2)}%`,
				availableLiquidity: availableCash,
				userBorrowCapacity,
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
		accountLiquidity,
		userAddress,
		tokenMetadata,
		userBorrowCapacity,
	]);

	const totalBorrowedUSD = useMemo(() => {
		return borrowedMarketsData.reduce((total, market) => {
			return total + parseFloat(market.usdValue || '0');
		}, 0);
	}, [borrowedMarketsData]);

	if (
		marketsLoading ||
		apyLoading ||
		positionsLoading ||
		liquidityLoading ||
		usdLoading ||
		tokenMetadataLoading ||
		!allMarkets
	) {
		return (
			<div className={css.container}>
				<p className={css.label}>Borrow Markets</p>
				<div>Fetching markets from blockchain...</div>
			</div>
		);
	}

	return (
		<div className={css.container}>
			<div className={css.headerSection}>
				<p className={css.label}>Borrow Markets</p>
				{borrowedMarketsData.length > 0 && (
					<p className={css.totalValue}>Total Borrowed: ${totalBorrowedUSD.toFixed(2)}</p>
				)}
			</div>

			{borrowedMarketsData.length > 0 ? (
				<>
					<p className={css.sectionHeader}>Your borrows</p>
					<Table
						data={borrowedMarketsData}
						columns={borrowedAssetsColumns}
						columnHeight="64px"
						columnWidth="120px"
						theme={tableCss}
					/>
				</>
			) : (
				<>
					<p className={css.sectionHeader}>Your borrows</p>
					<div className={css.emptyState}>Nothing borrowed yet</div>
				</>
			)}

			{availableMarketsData.length > 0 && <div className={css.delimiter} />}

			{availableMarketsData.length > 0 && (
				<>
					<p className={css.sectionHeader}>Assets to borrow</p>
					<Table
						data={availableMarketsData}
						columns={availableAssetsColumns}
						columnHeight="64px"
						columnWidth="120px"
						theme={tableCss}
					/>
				</>
			)}
		</div>
	);
};
