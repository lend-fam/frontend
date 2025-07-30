import { type FC, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import type { Address } from 'viem';
import {
	Table,
	type TableColumnProps,
	type TableData,
	AssetsColumn,
	BalanceColumn,
	CollateralToggle,
	ActionButtons,
	NativeYieldBadge,
} from '../../../ui-kit';
import {
	useAllMarkets,
	useUserMarkets,
	useUserSupplyPositions,
	useUSDBalances,
	useMarketWalletBalances,
	useNativeYield,
} from '../../../hooks';
import { useMarketsDataOptimized } from '../../../hooks/use-market-data-optimized.hook';
import { useTokenMetadata, type TokenMetadata } from '../../../hooks/use-token-metadata.hook';
import { MarketService, TokenService } from '../../../services';
import { Checkbox } from '../../../ui-kit/components/checkbox/checkbox.component';

import css from './markets-supply-table.module.css';
import tableCss from '../../../ui-kit/themes/market-table.module.css';

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
	nativeYieldAPY?: string;
	hasNativeYield?: boolean;
};

type MarketsSupplyTableColumn = 'assets' | 'balance' | 'apy' | 'collateral' | 'actions';

const createSuppliedAssetsColumns = (
	navigate: (path: string) => void,
): TableColumnProps<MarketsSupplyTableData, MarketsSupplyTableColumn>[] => [
	{
		key: 'assets',
		label: 'Assets',
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
	{
		key: 'apy',
		label: 'APY',
		align: 'right',
		width: '20%',
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
					{data.apy}
				</div>
				{data.hasNativeYield && data.nativeYieldAPY && <NativeYieldBadge apy={data.nativeYieldAPY} />}
			</div>
		),
	},
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

const createAvailableAssetsColumns = (
	navigate: (path: string) => void,
	tokenMetadata?: Record<Address, TokenMetadata>,
): TableColumnProps<MarketsSupplyTableData, MarketsSupplyTableColumn>[] => [
	{
		key: 'assets',
		label: 'Assets',
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
					{MarketService.formatTokenBalance(
						data.walletBalance,
						tokenMetadata?.[data.marketAddress]?.underlyingDecimals ?? 18,
					)}
				</div>
			</div>
		),
	},
	{
		key: 'apy',
		label: 'APY',
		align: 'right',
		width: '20%',
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
					{data.apy}
				</div>
				{data.hasNativeYield && data.nativeYieldAPY && <NativeYieldBadge apy={data.nativeYieldAPY} />}
			</div>
		),
	},
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
				<ActionButtons
					marketAddress={data.marketAddress}
					hasSupplied={data.hasSupplied}
					tokenSymbol={data.symbol}
					supplyAPY={data.supplyAPY}
					isCollateralEnabled={data.isCollateralEnabled}
					walletBalance={data.walletBalance}
					showMoreMenu
					onMoreClick={(marketAddress) => navigate(`/markets/${marketAddress}`)}
				/>
			</div>
		),
	},
];

export const MarketsSupplyTable: FC = () => {
	const navigate = useNavigate();
	const { address: userAddress } = useAccount();
	const { data: allMarkets, isLoading: marketsLoading } = useAllMarkets();
	const { data: optimizedMarketData } = useMarketsDataOptimized();
	const { data: userSupplyPositions } = useUserSupplyPositions(userAddress);
	const { data: userMarkets } = useUserMarkets(userAddress);
	const { data: nativeYieldData } = useNativeYield();
	const [showZeroBalance, setShowZeroBalance] = useState(true);

	const { data: walletBalances } = useMarketWalletBalances((allMarkets as Address[]) || []);

	const { data: tokenMetadata } = useTokenMetadata((allMarkets as Address[]) || []);

	const marketBalances = useMemo(() => {
		if (!allMarkets || !userSupplyPositions) return {};

		const balances: Record<string, { underlyingBalance: bigint; symbol: string; decimals: number }> = {};

		allMarkets.forEach((marketAddress) => {
			const userPosition = userSupplyPositions[marketAddress];
			const underlyingBalance = userPosition?.balance || 0n;

			const metadata = tokenMetadata?.[marketAddress];
			const symbol = TokenService.formatMarketName(undefined, undefined, marketAddress, metadata);
			const decimals = metadata?.underlyingDecimals ?? 18;

			balances[marketAddress] = {
				underlyingBalance,
				symbol,
				decimals,
			};
		});

		return balances;
	}, [allMarkets, userSupplyPositions, tokenMetadata]);

	const balanceData = useMemo(() => {
		return Object.entries(marketBalances)
			.filter(([, data]) => data.underlyingBalance > 0n)
			.map(([marketAddress, data]) => ({
				marketAddress: marketAddress as Address,
				balance: data.underlyingBalance,
				symbol: data.symbol,
				decimals: data.decimals,
			}));
	}, [marketBalances]);

	const { data: usdBalances } = useUSDBalances(balanceData);

	const suppliedAssetsColumns = useMemo(() => createSuppliedAssetsColumns(navigate), [navigate]);
	const availableAssetsColumns = useMemo(
		() => createAvailableAssetsColumns(navigate, tokenMetadata),
		[navigate, tokenMetadata],
	);

	const { suppliedMarketsData, availableMarketsData } = useMemo(() => {
		// Only return empty arrays on initial load, not during background refetches
		if (!allMarkets) {
			return { suppliedMarketsData: [], availableMarketsData: [] };
		}

		const supplied: TableData<MarketsSupplyTableData>[] = [];
		const available: TableData<MarketsSupplyTableData>[] = [];

		// Deduplicate market addresses to fix duplicate entries
		const uniqueMarkets = [...new Set(allMarkets)];

		for (let i = 0; i < uniqueMarkets.length; i++) {
			const marketAddress = uniqueMarkets[i];
			const metadata = tokenMetadata?.[marketAddress];
			const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress, metadata);
			const apyData = optimizedMarketData?.apyData?.[marketAddress];
			const baseAPY = parseFloat(apyData?.supplyAPY || '0.00');
			const userPosition = userSupplyPositions?.[marketAddress];
			const hasSupplied = userPosition?.hasSupplied || false;

			const marketBalance = marketBalances[marketAddress];
			const underlyingBalance = marketBalance?.underlyingBalance || 0n;

			const decimals = metadata?.underlyingDecimals ?? 18;
			const tokenAmount = hasSupplied ? MarketService.formatTokenBalance(underlyingBalance, decimals) : '0';

			const isCollateralEnabled = userMarkets?.includes(marketAddress) || false;
			const isCollateralEligible = true;

			const symbol =
				metadata?.underlyingSymbol || marketBalance?.symbol || displayName.replace('Market ', '').split(' ')[0];
			const walletBalance = walletBalances?.[marketAddress] || 0n;

			// Check if this is APE token and show native yield APY if available
			const isAPEToken = symbol.toUpperCase() === 'APE';
			const hasNativeYield = isAPEToken && nativeYieldData?.apy && parseFloat(nativeYieldData.apy) > 0;
			const nativeYieldAPY = hasNativeYield ? `${nativeYieldData?.apy}%` : undefined;

			const marketData: MarketsSupplyTableData = {
				assets: displayName,
				balance: tokenAmount,
				apy: `${baseAPY.toFixed(2)}%`,
				collateral: isCollateralEnabled ? 'enabled' : 'disabled',
				actions: '',
				marketAddress,
				tokenAmount,
				usdValue: usdBalances?.[marketAddress] || '0',
				symbol,
				isCollateralEnabled,
				isCollateralEligible,
				hasSupplied,
				supplyAPY: `${baseAPY.toFixed(2)}%`,
				walletBalance,
				nativeYieldAPY,
				hasNativeYield: !!hasNativeYield,
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
		optimizedMarketData,
		userSupplyPositions,
		userMarkets,
		marketBalances,
		usdBalances,
		walletBalances,
		tokenMetadata,
		nativeYieldData,
	]);

	const filteredAvailableMarketsData = useMemo(() => {
		if (showZeroBalance) {
			return availableMarketsData;
		}
		return availableMarketsData.filter((market) => market.walletBalance > 0n);
	}, [availableMarketsData, showZeroBalance]);

	const totalSuppliedUSD = useMemo(() => {
		return suppliedMarketsData.reduce((total, market) => {
			return total + parseFloat(market.usdValue || '0');
		}, 0);
	}, [suppliedMarketsData]);

	// Only show skeleton on initial load, not during background refetches
	const isInitialLoading = !allMarkets || (marketsLoading && !allMarkets);

	if (isInitialLoading) {
		return (
			<div className={css.container}>
				<div className={css.headerSection}>
					<h2 className={css.label}>Supply Markets</h2>
					<p className={css.totalValue}>Loading...</p>
				</div>
				<div className={css.loadingSkeleton}>
					{[...Array(3)].map((_, i) => (
						<div key={i} className={css.skeletonRow}>
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
			<div className={css.headerSection}>
				<p className={css.label}>Supply Markets</p>
				{suppliedMarketsData.length > 0 && (
					<p className={css.totalValue}>Total Supplied: ${totalSuppliedUSD.toFixed(2)}</p>
				)}
			</div>

			{suppliedMarketsData.length > 0 ? (
				<>
					<p className={css.sectionHeader}>Your Supplies</p>
					<Table
						data={suppliedMarketsData}
						columns={suppliedAssetsColumns}
						columnHeight="72px"
						columnWidth="120px"
						theme={tableCss}
					/>
				</>
			) : (
				<>
					<p className={css.sectionHeader}>Your Supplies</p>
					<div className={css.emptyState}>Nothing supplied yet</div>
				</>
			)}

			{availableMarketsData.length > 0 && <div className={css.delimiter} />}

			{availableMarketsData.length > 0 && (
				<>
					<div className={css.assetsToSupplyHeader}>
						<p className={css.sectionHeader}>Assets to Supply</p>
						<label className={css.filterCheckbox}>
							<Checkbox
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
						columnHeight="72px"
						columnWidth="120px"
						theme={tableCss}
					/>
				</>
			)}
		</div>
	);
};
