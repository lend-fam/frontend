import { type FC, useMemo } from 'react';
import type { Address } from 'viem';
import { useReadContracts } from 'wagmi';
import { CTOKEN_ABI, INTEREST_RATE_MODEL_ABI, BLOCKS_PER_YEAR } from '../../../contracts';
import { InterestRateChart } from './interest-rate-chart/interest-rate-chart.component';
import { useMarketTotals } from '../../../hooks';
import { MarketService } from '../../../services';
import { Card } from '../../../ui-kit/components/card/card.component';
import { SectionHeader } from '../../../ui-kit/components/section-header/section-header.component';

import css from './interest-rate-model-section.module.css';

interface InterestRateModelSectionProps {
	marketAddress: Address;
	apyData: {
		supplyAPY: string;
		borrowAPY: string;
	};
}

export const InterestRateModelSection: FC<InterestRateModelSectionProps> = ({ marketAddress, apyData }) => {
	const { data: marketTotals } = useMarketTotals();

	const { data: interestRateModelAddress } = useReadContracts({
		contracts: [
			{
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'interestRateModel',
			},
		],
		query: {
			staleTime: 300000, // 5 minutes
		},
	});

	const irModelAddress = interestRateModelAddress?.[0]?.result as Address;

	const { data: irModelData } = useReadContracts({
		contracts: [
			{
				address: irModelAddress,
				abi: INTEREST_RATE_MODEL_ABI,
				functionName: 'baseRatePerBlock',
			},
			{
				address: irModelAddress,
				abi: INTEREST_RATE_MODEL_ABI,
				functionName: 'multiplierPerBlock',
			},
			{
				address: irModelAddress,
				abi: INTEREST_RATE_MODEL_ABI,
				functionName: 'blocksPerYear',
			},
			{
				address: irModelAddress,
				abi: INTEREST_RATE_MODEL_ABI,
				functionName: 'jumpMultiplierPerBlock',
			},
			{
				address: irModelAddress,
				abi: INTEREST_RATE_MODEL_ABI,
				functionName: 'kink',
			},
			{
				address: irModelAddress,
				abi: INTEREST_RATE_MODEL_ABI,
				functionName: 'gapPerBlock',
			},
		],
		query: {
			enabled: !!irModelAddress,
			staleTime: 300000, // 5 minutes
		},
	});

	const interestRateMetrics = useMemo(() => {
		const marketData = marketTotals?.[marketAddress];
		if (!marketData || !irModelData) {
			return {
				utilizationRate: 0,
				currentBorrowAPY: 0,
				currentSupplyAPY: 0,
				optimalUtilization: 80,
				optimalAPY: 25,
				maxAPY: 100,
				modelType: 'Unknown',
			};
		}

		const baseRatePerBlock = irModelData[0]?.result as bigint;
		const multiplierPerBlock = irModelData[1]?.result as bigint;
		const contractBlocksPerYear = irModelData[2]?.result as bigint;
		const jumpMultiplierPerBlock = irModelData[3]?.result as bigint;
		const kink = irModelData[4]?.result as bigint;
		const gapPerBlock = irModelData[5]?.result as bigint;

		const blocksPerYear = contractBlocksPerYear ? Number(contractBlocksPerYear) : BLOCKS_PER_YEAR;
		let modelType = 'WhitePaper';
		if (jumpMultiplierPerBlock !== undefined && kink !== undefined) {
			if (gapPerBlock !== undefined && gapPerBlock > 0n) {
				modelType = 'DAI';
			} else {
				modelType = 'JumpRate';
			}
		}

		const utilizationRate = MarketService.calculateUtilizationRate(
			marketData.totalBorrows,
			marketData.getCash,
			marketData.totalReserves,
		);

		const baseRateAPY = baseRatePerBlock ? ((Number(baseRatePerBlock) * blocksPerYear) / 1e18) * 100 : 0;
		const multiplierAPY = multiplierPerBlock ? ((Number(multiplierPerBlock) * blocksPerYear) / 1e18) * 100 : 0;
		const jumpMultiplierAPY = jumpMultiplierPerBlock
			? ((Number(jumpMultiplierPerBlock) * blocksPerYear) / 1e18) * 100
			: 0;
		const kinkUtilization = kink ? (Number(kink) / 1e18) * 100 : 80;
		let optimalAPY: number;
		let maxAPY: number;

		if (modelType === 'WhitePaper') {
			optimalAPY = baseRateAPY + multiplierAPY;
			maxAPY = optimalAPY;
		} else {
			optimalAPY = baseRateAPY + (kinkUtilization / 100) * multiplierAPY;
			maxAPY = optimalAPY + ((100 - kinkUtilization) / 100) * jumpMultiplierAPY;
		}

		const currentBorrowAPY = parseFloat(apyData.borrowAPY) || 0;
		const currentSupplyAPY = parseFloat(apyData.supplyAPY) || 0;

		return {
			utilizationRate,
			currentBorrowAPY,
			currentSupplyAPY,
			optimalUtilization: kinkUtilization,
			optimalAPY,
			maxAPY,
			baseRateAPY,
			multiplierAPY,
			jumpMultiplierAPY,
			modelType,
			contractParams: {
				baseRatePerBlock: baseRatePerBlock?.toString() || '0',
				multiplierPerBlock: multiplierPerBlock?.toString() || '0',
				jumpMultiplierPerBlock: jumpMultiplierPerBlock?.toString() || '0',
				kink: kink?.toString() || '0',
				gapPerBlock: gapPerBlock?.toString() || '0',
				blocksPerYear: blocksPerYear.toString(),
			},
		};
	}, [marketTotals, marketAddress, apyData, irModelData]);

	return (
		<Card style={{ minHeight: '300px' }}>
			<SectionHeader
				title={`Interest rate model (${interestRateMetrics.modelType})`}
				variant="main"
				action={<button className={css.strategyButton}>Interest Rate Strategy</button>}
			/>
			<div className={css.content}>
				<div className={css.rateInfo}>
					<div className={css.utilizationRate}>
						<span className={css.rateLabel}>Utilization Rate</span>
						<span className={css.rateValue}>{interestRateMetrics.utilizationRate.toFixed(2)}%</span>
					</div>
					<div className={css.currentRate}>
						<span className={css.rateLabel}>Current Borrow APY</span>
						<span className={css.rateValue}>{interestRateMetrics.currentBorrowAPY.toFixed(2)}%</span>
					</div>
					<div className={css.optimalRate}>
						<span className={css.rateLabel}>Base Rate</span>
						<span className={css.rateValue}>{interestRateMetrics.baseRateAPY?.toFixed(2) || '0.00'}%</span>
					</div>
					{interestRateMetrics.modelType !== 'WhitePaper' && (
						<div className={css.optimalRate}>
							<span className={css.rateLabel}>
								APY at Kink ({interestRateMetrics.optimalUtilization.toFixed(1)}%)
							</span>
							<span className={css.rateValue}>{interestRateMetrics.optimalAPY.toFixed(1)}%</span>
						</div>
					)}
					<div className={css.currentRate}>
						<span className={css.rateLabel}>Max APY</span>
						<span className={css.rateValue}>{interestRateMetrics.maxAPY.toFixed(1)}%</span>
					</div>
				</div>

				<div className={css.chartSection}>
					<InterestRateChart
						currentRate={interestRateMetrics.currentBorrowAPY}
						currentUtilization={interestRateMetrics.utilizationRate}
						interestRateParams={{
							baseRateAPY: interestRateMetrics.baseRateAPY || 0,
							multiplierAPY: interestRateMetrics.multiplierAPY || 0,
							jumpMultiplierAPY: interestRateMetrics.jumpMultiplierAPY,
							kinkUtilization: interestRateMetrics.optimalUtilization,
							modelType: interestRateMetrics.modelType,
						}}
					/>
				</div>

				<div className={css.legend}>
					<div className={css.legendItem}>
						<span className={css.legendDot} style={{ backgroundColor: '#4CAF50' }}></span>
						<span>Borrow APY curve</span>
					</div>
					<div className={css.legendItem}>
						<span className={css.legendDot} style={{ backgroundColor: '#2196F3' }}></span>
						<span>Current utilization</span>
					</div>
					{interestRateMetrics.modelType !== 'WhitePaper' && (
						<div className={css.legendItem}>
							<span className={css.legendDot} style={{ backgroundColor: '#FF9800' }}></span>
							<span>Kink point</span>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
};
