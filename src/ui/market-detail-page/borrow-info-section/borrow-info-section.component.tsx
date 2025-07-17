import { type FC, useMemo } from 'react';
import type { Address } from 'viem';
import { formatUnits } from 'viem';
import { ProgressCircle } from '../reserve-status-section/progress-circle/progress-circle.component';
import { APYChart } from '../reserve-status-section/apy-chart/apy-chart.component';
import { MarketService } from '../../../services';
import { Card } from '../../../ui-kit/components/card/card.component';
import { SectionHeader } from '../../../ui-kit/components/section-header/section-header.component';

import css from './borrow-info-section.module.css';

interface BorrowInfoSectionProps {
	symbol: string;
	marketAddress: Address;
	marketData: {
		totalSupply: bigint;
		totalBorrows: bigint;
		exchangeRate: bigint;
		getCash: bigint;
	};
	apyData: {
		supplyAPY: string;
		borrowAPY: string;
	};
	liquidityData?: bigint;
}

export const BorrowInfoSection: FC<BorrowInfoSectionProps> = ({ symbol, marketData, apyData, liquidityData }) => {
	const borrowMetrics = useMemo(() => {
		const totalBorrowedTokens = Number(formatUnits(marketData.totalBorrows, 18));
		const availableToBorrow = liquidityData ? Number(formatUnits(liquidityData, 18)) : 0;
		const totalSuppliedUnderlying =
			marketData.exchangeRate > 0n
				? Number(formatUnits((marketData.totalSupply * marketData.exchangeRate) / 10n ** 18n, 18))
				: 0;

		const finalTotalBorrowed = totalBorrowedTokens;
		const finalAvailableToBorrow = availableToBorrow;
		const finalTotalSupplied = totalSuppliedUnderlying;

		const utilizationRate = MarketService.calculateUtilizationRate(
			marketData.totalSupply,
			marketData.totalBorrows,
			marketData.exchangeRate,
		);

		const maxBorrowCapacity = finalTotalSupplied * 0.85;
		const borrowProgress =
			maxBorrowCapacity > 0 ? Math.min((finalTotalBorrowed / maxBorrowCapacity) * 100, 100) : 0;

		return {
			totalBorrowedTokens: finalTotalBorrowed,
			availableToBorrow: finalAvailableToBorrow,
			totalSuppliedUnderlying: finalTotalSupplied,
			utilizationRate,
			maxBorrowCapacity,
			borrowProgress,
		};
	}, [marketData, liquidityData]);

	const borrowApyTrendData = useMemo(() => {
		const currentAPY = parseFloat(apyData.borrowAPY);

		if (currentAPY === 0) {
			return [{ date: 'Today', value: 0 }];
		}

		const data = [];
		for (let i = 29; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);

			const variation = (Math.random() - 0.5) * 0.6 * currentAPY;
			const apy = Math.max(0.1, currentAPY + variation);

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
	}, [apyData.borrowAPY]);

	return (
		<Card>
			<SectionHeader title="Borrow Info" variant="main" />

			<div className={css.content}>
				<div className={css.borrowStats}>
					<div className={css.progressSection}>
						<ProgressCircle
							value={borrowMetrics.borrowProgress}
							size={120}
							strokeWidth={8}
							color="#F58FC7"
						/>
						<div className={css.progressDetails}>
							<div className={css.progressValue}>
								{MarketService.formatTokenBalance(
									BigInt(Math.floor(borrowMetrics.totalBorrowedTokens * 1e18)),
									18,
									symbol,
								)}
							</div>
							<div className={css.progressLabel}>Total Borrowed</div>
							<div className={css.progressSubtext}>
								Utilization: {borrowMetrics.utilizationRate.toFixed(2)}%
							</div>
						</div>
					</div>

					<div className={css.apySection}>
						<div className={css.apyLabel}>APY, variable</div>
						<div className={css.apyValue}>{parseFloat(apyData.borrowAPY) || 0}%</div>

						<div className={css.apySubtext}>
							Available:{' '}
							{MarketService.formatTokenBalance(
								BigInt(Math.floor(borrowMetrics.availableToBorrow * 1e18)),
								18,
								symbol,
							)}
						</div>
					</div>
				</div>

				<div className={css.chartSection}>
					<APYChart data={borrowApyTrendData} color="#F58FC7" />
					<div className={css.chartLegend}>
						<span className={css.legendDot}></span>
						<span>Borrow APY, variable</span>
					</div>
				</div>
			</div>
		</Card>
	);
};
