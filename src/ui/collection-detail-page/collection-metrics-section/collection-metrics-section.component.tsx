import { type FC } from 'react';
import { Card } from '../../../ui-kit/components/card/card.component';
import { SectionHeader } from '../../../ui-kit/components/section-header/section-header.component';
import { InlineCode } from '../../../ui-kit/components/inline-code/inline-code.component';
import { typedMemo } from '../../../ui-kit/utils/typed-memo.utils';
import type { CollectionDetailData } from '../collection-detail-page.component';

import css from './collection-metrics-section.module.css';
import SignLinearIcon from '../../../assets/svg/Sign_linear.svg?url';
import SignExponentialIcon from '../../../assets/svg/Sign_exponential.svg?url';

interface CollectionMetricsSectionProps {
	collectionData: CollectionDetailData;
}

const CollectionMetricsSectionComponent: FC<CollectionMetricsSectionProps> = ({ collectionData }) => {
	const { yieldSharePercentage, weightFunction } = collectionData;

	return (
		<Card>
			<div className={css.container}>
				<SectionHeader title="Collection Metrics" />

				<div className={css.metricsGrid}>
					<div className={css.metricItem}>
						<div className={css.metricLabel}>Yield Share</div>
						<div className={css.metricValue}>{yieldSharePercentage}%</div>
						<div className={css.metricDescription}>Percentage of collection yield shared with holders</div>
					</div>

					<div className={css.metricItem}>
						<div className={css.metricLabel}>Weight Function</div>
						<div className={css.metricValueWithIcon}>
							<span className={css.metricValue}>{weightFunction?.type || 'Linear'}</span>
							<img
								src={weightFunction?.type === 'EXPONENTIAL' ? SignExponentialIcon : SignLinearIcon}
								alt={`${weightFunction?.type === 'EXPONENTIAL' ? 'Exponential' : 'Linear'} weight function`}
								className={css.weightFunctionIcon}
							/>
						</div>
						<div className={css.metricDescription}>
							Function determining how NFT count correlates with user subsidies
						</div>
					</div>

					<div className={css.metricItem}>
						<div className={css.metricLabel}>Function Parameters</div>
						<div className={css.metricValue}>
							p1: {collectionData.weightFunctionParameters.p1}, p2:{' '}
							{collectionData.weightFunctionParameters.p2}
						</div>
						<div className={css.metricDescription}>
							Mathematical parameters controlling function behavior
						</div>
					</div>

					<div className={css.metricItem}>
						<div className={css.metricLabel}>Vault Count</div>
						<div className={css.metricValue}>{collectionData.vaultCount}</div>
						<div className={css.metricDescription}>Total number of active vaults in this collection</div>
					</div>
				</div>

				<div className={css.formulaSection}>
					<SectionHeader title="Weight Function Formula" variant="subsection" />
					<div className={css.formulaContainer}>
						<div className={css.formula}>{collectionData.weightFunctionParameters.formula}</div>
					</div>
					<div className={css.formulaDescription}>
						Where <InlineCode>x</InlineCode> is the user&apos;s NFT count and <InlineCode>p1</InlineCode>,{' '}
						<InlineCode>p2</InlineCode> are configurable parameters
					</div>
				</div>
			</div>
		</Card>
	);
};

export const CollectionMetricsSection = typedMemo(CollectionMetricsSectionComponent);
