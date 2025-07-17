import { type FC } from 'react';
import { Card } from '../../../ui-kit/components/card/card.component';
import { SectionHeader } from '../../../ui-kit/components/section-header/section-header.component';
import { typedMemo } from '../../../ui-kit/utils/typed-memo.utils';
import type { CollectionData } from '../collection-detail-page.component';

import css from './collection-metrics-section.module.css';

interface CollectionMetricsSectionProps {
	collectionData: CollectionData;
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
						<div className={css.metricValue}>{weightFunction.fnType}</div>
						<div className={css.metricDescription}>
							Function determining how NFT count correlates with user subsidies
						</div>
					</div>

					<div className={css.metricItem}>
						<div className={css.metricLabel}>Function Parameters</div>
						<div className={css.metricValue}>
							p1: {weightFunction.p1}, p2: {weightFunction.p2}
						</div>
						<div className={css.metricDescription}>
							Mathematical parameters controlling function behavior
						</div>
					</div>

					<div className={css.metricItem}>
						<div className={css.metricLabel}>Vault Count</div>
						<div className={css.metricValue}>{collectionData.vaults.length}</div>
						<div className={css.metricDescription}>Total number of active vaults in this collection</div>
					</div>
				</div>

				<div className={css.formulaSection}>
					<SectionHeader title="Weight Function Formula" variant="subsection" />
					<div className={css.formulaContainer}>
						{weightFunction.fnType === 'LINEAR' ? (
							<div className={css.formula}>
								<code>weight = p1 * x + p2</code>
							</div>
						) : (
							<div className={css.formula}>
								<code>weight = p1 * x^p2</code>
							</div>
						)}
					</div>
					<div className={css.formulaDescription}>
						Where <code>x</code> is the user&apos;s NFT count and <code>p1</code>, <code>p2</code> are
						configurable parameters
					</div>
				</div>
			</div>
		</Card>
	);
};

export const CollectionMetricsSection = typedMemo(CollectionMetricsSectionComponent);
