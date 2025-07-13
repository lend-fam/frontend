import { type FC, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import {
	Table,
	type TableColumnProps,
	type TableData,
	AssetsColumn,
	BalanceColumn,
	CollateralToggle,
	ActionButtons,
} from '../../../ui-kit';
import {
	useAllMarkets,
	useUserMarkets,
	useUserSupplyPositions,
	useMarketsAPY,
	useUSDBalances,
	useMarketWalletBalances,
} from '../../../hooks';
import { MarketService, TokenService } from '../../../services';

import css from './markets-supply-table.module.css';
import tableCss from './theme/table.module.css';

type MarketsSupplyTableData = {
	assets: string;
	balance: string;
	apy: string;
	collateral: string;
	actions: string;
	marketAddress: Address;
	tokenAmount: string;
	usdValue: string;
	symbol: string;
	isCollateralEnabled: boolean;
	isCollateralEligible: boolean;
	hasSupplied: boolean;
	supplyAPY: string;
	walletBalance: bigint;
};

type MarketsSupplyTableColumn = 'assets' | 'balance' | 'apy' | 'collateral' | 'actions';

const suppliedAssetsColumns: TableColumnProps<MarketsSupplyTableData, MarketsSupplyTableColumn>[] = [
	{ key: 'assets', label: 'Asset', width: '20%', cellRenderer: AssetsColumn },
	{
		key: 'balance',
		label: 'Balance',
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
				<BalanceColumn tokenAmount={data.tokenAmount} usdValue={data.usdValue} symbol={data.symbol} />
			</div>
		),
	},
	{ key: 'apy', label: 'APY', align: 'right', width: '20%' },
	{
		key: 'collateral',
		label: 'Collateral',
		align: 'center',
		width: '20%',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '0 12px',
				}}>
				<CollateralToggle
					marketAddress={data.marketAddress}
					isEnabled={data.isCollateralEnabled}
					isEligible={data.isCollateralEligible}
				/>
			</div>
		),
	},
	{
		key: 'actions',
		label: 'Actions',
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
				<ActionButtons
					marketAddress={data.marketAddress}
					hasSupplied={data.hasSupplied}
					tokenSymbol={data.symbol}
					supplyAPY={data.supplyAPY}
					isCollateralEnabled={data.isCollateralEnabled}
					walletBalance={data.walletBalance}
				/>
			</div>
		),
	},
];

const availableAssetsColumns: TableColumnProps<MarketsSupplyTableData, MarketsSupplyTableColumn>[] = [
	{ key: 'assets', label: 'Assets', width: '20%', cellRenderer: AssetsColumn },
	{
		key: 'balance',
		label: 'Wallet balance',
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
				<div style={{ textAlign: 'right', fontFamily: 'Inter', fontSize: '14px', fontWeight: '500' }}>
					{MarketService.formatTokenBalance(data.walletBalance, 18)} {data.symbol}
				</div>
			</div>
		),
	},
	{ key: 'apy', label: 'APY', align: 'right', width: '20%' },
	{
		key: 'collateral',
		label: 'Enter market',
		align: 'center',
		width: '20%',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '0 12px',
				}}>
				<CollateralToggle
					marketAddress={data.marketAddress}
					isEnabled={data.isCollateralEnabled}
					isEligible={data.isCollateralEligible}
				/>
			</div>
		),
	},
	{
		key: 'actions',
		label: 'Actions',
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
				<ActionButtons
					marketAddress={data.marketAddress}
					hasSupplied={data.hasSupplied}
					tokenSymbol={data.symbol}
					supplyAPY={data.supplyAPY}
					isCollateralEnabled={data.isCollateralEnabled}
					walletBalance={data.walletBalance}
					showMoreMenu
				/>
			</div>
		),
	},
];

const COLUMN_HEIGHT = '72px';
const COLUMN_WIDTH = '120px';

export const MarketsSupplyTable: FC = () => {
	const { address: userAddress } = useAccount();
	const { data: allMarkets, isLoading: marketsLoading } = useAllMarkets();
	const { data: marketsAPY, isLoading: apyLoading } = useMarketsAPY();
	const { data: userSupplyPositions, isLoading: positionsLoading } = useUserSupplyPositions(userAddress);
	const { data: userMarkets } = useUserMarkets(userAddress);
	const [showZeroBalance, setShowZeroBalance] = useState(true);

	const { data: walletBalances, isLoading: walletBalancesLoading } = useMarketWalletBalances(
		(allMarkets as Address[]) || [],
	);

	const marketBalances = useMemo(() => {
		if (!allMarkets || !userSupplyPositions) return {};

		const balances: Record<string, { underlyingBalance: bigint; symbol: string }> = {};

		allMarkets.forEach((marketAddress) => {
			const userPosition = userSupplyPositions[marketAddress];
			const underlyingBalance = userPosition?.balance || 0n;

			const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress);
			const symbol = displayName.replace('Market ', '').split(' ')[0];

			balances[marketAddress] = {
				underlyingBalance,
				symbol,
			};
		});

		return balances;
	}, [allMarkets, userSupplyPositions]);

	const balanceData = useMemo(() => {
		return Object.entries(marketBalances)
			.filter(([, data]) => data.underlyingBalance > 0n)
			.map(([marketAddress, data]) => ({
				marketAddress: marketAddress as Address,
				balance: data.underlyingBalance,
				symbol: data.symbol,
				decimals: 18,
			}));
	}, [marketBalances]);

	const { data: usdBalances, isLoading: usdLoading } = useUSDBalances(balanceData);

	const { suppliedMarketsData, availableMarketsData } = useMemo(() => {
		if (!allMarkets || marketsLoading || apyLoading) {
			return { suppliedMarketsData: [], availableMarketsData: [] };
		}

		const supplied: TableData<MarketsSupplyTableData>[] = [];
		const available: TableData<MarketsSupplyTableData>[] = [];

		for (let i = 0; i < allMarkets.length; i++) {
			const marketAddress = allMarkets[i];
			const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress);
			const apyData = marketsAPY?.[marketAddress];
			const apy = apyData?.supplyAPY || '0.00';
			const userPosition = userSupplyPositions?.[marketAddress];
			const hasSupplied = userPosition?.hasSupplied || false;

			const marketBalance = marketBalances[marketAddress];
			const underlyingBalance = marketBalance?.underlyingBalance || 0n;

			const tokenAmount = hasSupplied ? MarketService.formatTokenBalance(underlyingBalance, 18) : '0';

			const isCollateralEnabled = userMarkets?.includes(marketAddress) || false;
			const isCollateralEligible = true;

			const symbol = marketBalance?.symbol || displayName.replace('Market ', '').split(' ')[0];

			const walletBalance = walletBalances?.[marketAddress] || 0n;

			const marketData: MarketsSupplyTableData = {
				assets: displayName,
				balance: tokenAmount,
				apy: `${apy}%`,
				collateral: isCollateralEnabled ? 'enabled' : 'disabled',
				actions: '',
				marketAddress,
				tokenAmount,
				usdValue: usdBalances?.[marketAddress] || '0',
				symbol,
				isCollateralEnabled,
				isCollateralEligible,
				hasSupplied,
				supplyAPY: `${apy}%`,
				walletBalance,
			};

			if (hasSupplied) {
				supplied.push(marketData);
			} else {
				available.push(marketData);
			}
		}

		return {
			suppliedMarketsData: supplied,
			availableMarketsData: available,
		};
	}, [
		allMarkets,
		marketsLoading,
		apyLoading,
		marketsAPY,
		userSupplyPositions,
		userMarkets,
		marketBalances,
		usdBalances,
		walletBalances,
	]);

	const filteredAvailableMarketsData = useMemo(() => {
		if (showZeroBalance) {
			return availableMarketsData;
		}
		return availableMarketsData.filter((market) => market.tokenAmount !== '0');
	}, [availableMarketsData, showZeroBalance]);

	if (marketsLoading || apyLoading || positionsLoading || usdLoading || walletBalancesLoading || !allMarkets) {
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

			{suppliedMarketsData.length > 0 && (
				<>
					<p className={css.sectionHeader}>Your Supplies</p>
					<Table
						data={suppliedMarketsData}
						columns={suppliedAssetsColumns}
						columnHeight={COLUMN_HEIGHT}
						columnWidth={COLUMN_WIDTH}
						theme={tableCss}
					/>
				</>
			)}

			{suppliedMarketsData.length > 0 && availableMarketsData.length > 0 && <div className={css.delimiter} />}

			{availableMarketsData.length > 0 && (
				<>
					<div className={css.assetsToSupplyHeader}>
						<p className={css.sectionHeader}>Assets to Supply</p>
						<label className={css.filterCheckbox}>
							<input
								type="checkbox"
								checked={showZeroBalance}
								onChange={(e) => setShowZeroBalance(e.target.checked)}
								className={css.checkbox}
							/>
							<span className={css.checkboxLabel}>Show assets with 0 balance</span>
						</label>
					</div>
					<Table
						data={filteredAvailableMarketsData}
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
