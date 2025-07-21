import { type FC, useMemo, useState } from 'react';
import type { Address } from 'viem';
import { formatUnits } from 'viem';
import { ProgressCircle } from './progress-circle/progress-circle.component';
import { EnhancedAPYChartDebug } from './apy-chart/enhanced-apy-chart-debug.component';
import { TimeRangeSelector } from './time-range-selector/time-range-selector.component';
import { Card } from '../../../ui-kit/components/card/card.component';
import { NativeYieldBadge } from '../../../ui-kit/components/native-yield-badge/native-yield-badge.component';
import { SectionHeader } from '../../../ui-kit/components/section-header/section-header.component';
import { MarketService } from '../../../services';
import { useNativeYield } from '../../../hooks/use-native-yield.hook';
import { type TimeRange } from '../../../hooks/use-apy-chart-data.hook';

import css from './reserve-status-section.module.css';

interface ReserveStatusSectionProps {
	symbol: string;
	marketAddress: Address;
	marketData: {
		totalSupply: bigint;
		totalBorrows: bigint;
		totalReserves: bigint;
		exchangeRate: bigint;
		getCash: bigint;
	};
	apyData: {
		supplyAPY: string;
		borrowAPY: string;
	};
	collateralFactor?: number;
}

export const ReserveStatusSection: FC<ReserveStatusSectionProps> = ({
	symbol,
	marketAddress,
	marketData,
	apyData,
	collateralFactor,
}) => {
	const { data: nativeYieldData } = useNativeYield();
	const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('7d');

	const supplyMetrics = useMemo(() => {
		const totalSuppliedUnderlying =
			marketData.exchangeRate > 0n ? (marketData.totalSupply * marketData.exchangeRate) / 10n ** 18n : 0n;

		const currentSupplyTokens = Number(formatUnits(totalSuppliedUnderlying, 18));
		const totalBorrowedTokens = Number(formatUnits(marketData.totalBorrows, 18));
		const availableLiquidity = Number(formatUnits(marketData.getCash, 18));

		const utilizationRate = MarketService.calculateUtilizationRate(
			marketData.totalBorrows,
			marketData.getCash,
			marketData.totalReserves,
		);

		const supplyProgress = currentSupplyTokens > 0 ? 100 : 0;

		return {
			currentSupplyTokens,
			totalBorrowedTokens,
			availableLiquidity,
			utilizationRate,
			supplyProgress,
		};
	}, [marketData]);

	const collateralMetrics = useMemo(() => {
		const maxLTV = collateralFactor ? (collateralFactor * 100).toFixed(1) : '0.0';
		const liquidationThreshold = collateralFactor ? (collateralFactor * 100 + 5).toFixed(1) : '0.0';
		const liquidationPenalty = '8.50';
		const canBeCollateral = collateralFactor ? collateralFactor > 0 : false;

		return {
			maxLTV,
			liquidationThreshold,
			liquidationPenalty,
			canBeCollateral,
		};
	}, [collateralFactor]);

	const apyTrendData = useMemo(() => {
		const currentAPY = parseFloat(apyData.supplyAPY);

		if (currentAPY === 0) {
			return [{ date: 'Today', value: 0 }];
		}

		const data = [];
		for (let i = 29; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);

			const variation = (Math.random() - 0.5) * 0.4 * currentAPY;
			const apy = Math.max(0, currentAPY + variation);

			data.push({
				date:
					i === 0
						? 'Today'
						: i <= 7
							? `${i}d ago`
							: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
				value: apy,
			});
		}

		return [data[0], data[7], data[14], data[21], data[29]];
	}, [apyData.supplyAPY]);
	const isAPEToken = symbol === 'APE' || symbol === 'Ape';
	const hasNativeYield = isAPEToken && nativeYieldData?.apy && parseFloat(nativeYieldData.apy) > 0;
	const nativeYieldAPY = hasNativeYield ? `${nativeYieldData?.apy}%` : undefined;

	return (
		<Card>
			<SectionHeader title="Reserve status & configuration" variant="main" />

			<div className={css.content}>
				<div className={css.supplyStats}>
					<div className={css.progressSection}>
						<ProgressCircle
							value={supplyMetrics.supplyProgress}
							size={120}
							strokeWidth={8}
							color="#4CAF50"
							showInfinity={true}
						/>
						<div className={css.progressDetails}>
							<div className={css.progressValue}>
								{MarketService.formatTokenBalance(
									BigInt(Math.floor(supplyMetrics.currentSupplyTokens * 1e18)),
									18,
									symbol,
								)}
							</div>
							<div className={css.progressLabel}>Total Supplied</div>
							<div className={css.progressSubtext}>
								Utilization: {supplyMetrics.utilizationRate.toFixed(2)}%
							</div>
						</div>
					</div>

					<div className={css.apySection}>
						<div className={css.apyLabel}>APY</div>
						<div className={css.apyValue}>{parseFloat(apyData.supplyAPY) || 0}%</div>
						{hasNativeYield && nativeYieldAPY && <NativeYieldBadge apy={nativeYieldAPY} />}
						<div className={css.apySubtext}>
							Available:{' '}
							{MarketService.formatTokenBalance(
								BigInt(Math.floor(supplyMetrics.availableLiquidity * 1e18)),
								18,
								symbol,
							)}
						</div>
					</div>
				</div>

				<div className={css.collateralUsage}>
					<div className={css.collateralHeader}>
						<SectionHeader title="Collateral usage" variant="subsection" />
						<div className={css.collateralStatus}>
							<span
								className={css.statusIndicator}
								style={{
									background: collateralMetrics.canBeCollateral ? '#4CAF50' : '#f44336',
								}}></span>
							<span>
								{collateralMetrics.canBeCollateral ? 'Can be collateral' : 'Cannot be collateral'}
							</span>
						</div>
					</div>

					<div className={css.collateralMetrics}>
						<div className={css.metric}>
							<span className={css.metricLabel}>Max LTV</span>
							<span className={css.metricValue}>{collateralMetrics.maxLTV}%</span>
						</div>
						<div className={css.metric}>
							<span className={css.metricLabel}>Liquidation threshold</span>
							<span className={css.metricValue}>{collateralMetrics.liquidationThreshold}%</span>
						</div>
						<div className={css.metric}>
							<span className={css.metricLabel}>Liquidation penalty</span>
							<span className={css.metricValue}>{collateralMetrics.liquidationPenalty}%</span>
						</div>
					</div>
				</div>
			</div>

			<div className={css.chartSection}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '12px',
					}}>
					<div className={css.chartLegend}>
						<span className={css.legendDot}></span>
						<span>Supply APY</span>
					</div>
					<TimeRangeSelector
						selectedRange={selectedTimeRange}
						onRangeChange={setSelectedTimeRange}
						cTokenMarket={marketAddress.toLowerCase()}
					/>
				</div>
				<EnhancedAPYChartDebug
					cTokenMarket={marketAddress.toLowerCase()}
					timeRange={selectedTimeRange}
					metric="supply"
					color="#4CAF50"
					fallbackData={apyTrendData}
				/>
			</div>
		</Card>
	);
};
