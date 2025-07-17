import { type FC, useState } from 'react';
import { Card } from '../../../ui-kit/components/card/card.component';
import { SectionHeader } from '../../../ui-kit/components/section-header/section-header.component';
import { Badge } from '../../../ui-kit/components/badge/badge.component';
import { typedMemo } from '../../../ui-kit/utils/typed-memo.utils';
import type { CollectionData } from '../collection-detail-page.component';

import css from './yield-config-section.module.css';

interface YieldConfigSectionProps {
	collectionData: CollectionData;
}

const YieldConfigSectionComponent: FC<YieldConfigSectionProps> = ({ collectionData }) => {
	const { yieldSharePercentage, weightFunction } = collectionData;
	const [nftCount, setNftCount] = useState(1);

	// Calculate weight based on current NFT count
	const calculateWeight = (count: number) => {
		if (weightFunction.fnType === 'LINEAR') {
			return weightFunction.p1 * count + weightFunction.p2;
		} else {
			return weightFunction.p1 * Math.pow(count, weightFunction.p2);
		}
	};

	const currentWeight = calculateWeight(nftCount);

	return (
		<Card>
			<div className={css.container}>
				<SectionHeader title="Yield Configuration" />

				<div className={css.configGrid}>
					<div className={css.configSection}>
						<h3 className={css.sectionTitle}>Yield Share</h3>
						<div className={css.yieldShareContainer}>
							<div className={css.yieldShareValue}>{yieldSharePercentage}%</div>
							<div className={css.yieldShareBps}>({yieldSharePercentage * 100} bps)</div>
						</div>
						<div className={css.yieldShareDescription}>
							Percentage of collection yield shared with holders. The remaining yield goes to collection
							vaults.
						</div>
					</div>

					<div className={css.configSection}>
						<h3 className={css.sectionTitle}>Weight Function</h3>
						<div className={css.weightFunctionContainer}>
							<Badge variant="info" size="medium">
								{weightFunction.fnType}
							</Badge>
							<div className={css.weightFunctionFormula}>
								{weightFunction.fnType === 'LINEAR' ? (
									<code>
										f(x) = {weightFunction.p1} × x + {weightFunction.p2}
									</code>
								) : (
									<code>
										f(x) = {weightFunction.p1} × x^{weightFunction.p2}
									</code>
								)}
							</div>
						</div>
						<div className={css.weightFunctionDescription}>
							Mathematical function that determines how NFT count correlates with user subsidies for this
							collection.
						</div>
					</div>
				</div>

				<div className={css.parametersSection}>
					<SectionHeader title="Function Parameters" variant="subsection" />
					<div className={css.parametersGrid}>
						<div className={css.parameterItem}>
							<div className={css.parameterLabel}>Parameter 1 (p1)</div>
							<div className={css.parameterValue}>{weightFunction.p1}</div>
							<div className={css.parameterDescription}>
								{weightFunction.fnType === 'LINEAR'
									? 'Linear slope coefficient'
									: 'Exponential base multiplier'}
							</div>
						</div>
						<div className={css.parameterItem}>
							<div className={css.parameterLabel}>Parameter 2 (p2)</div>
							<div className={css.parameterValue}>{weightFunction.p2}</div>
							<div className={css.parameterDescription}>
								{weightFunction.fnType === 'LINEAR'
									? 'Linear y-intercept value'
									: 'Exponential power value'}
							</div>
						</div>
					</div>
				</div>

				<div className={css.exampleSection}>
					<SectionHeader title="Example Calculation" variant="subsection" />
					<div className={css.exampleContainer}>
						<div className={css.sliderContainer}>
							<div className={css.sliderLabel}>
								NFT Count: <strong>{nftCount}</strong>
							</div>
							<input
								type="range"
								min="1"
								max="100"
								value={nftCount}
								onChange={(e) => setNftCount(parseInt(e.target.value))}
								className={css.slider}
							/>
							<div className={css.sliderRange}>
								<span>1</span>
								<span>100</span>
							</div>
						</div>
						<div className={css.exampleInput}>
							Input value: <code>x = {nftCount}</code>
						</div>
						<div className={css.exampleOutput}>
							Weight Multiplier:{' '}
							<code>
								{weightFunction.fnType === 'LINEAR'
									? `${weightFunction.p1} × ${nftCount} + ${weightFunction.p2} = ${currentWeight.toFixed(2)}`
									: `${weightFunction.p1} × ${nftCount}^${weightFunction.p2} = ${currentWeight.toFixed(2)}`}
							</code>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
};

export const YieldConfigSection = typedMemo(YieldConfigSectionComponent);
