import { type FC, useState, useMemo } from 'react';
import { Card } from '../../../ui-kit/components/card/card.component';
import { SectionHeader } from '../../../ui-kit/components/section-header/section-header.component';
import { Badge } from '../../../ui-kit/components/badge/badge.component';
import { typedMemo } from '../../../ui-kit/utils/typed-memo.utils';
import { CollectionService } from '../../../services/collection.service';
import type { CollectionDetailData } from '../collection-detail-page.component';

import css from './yield-config-section.module.css';
import SignLinearIcon from '../../../assets/svg/Sign_linear.svg?url';
import SignExponentialIcon from '../../../assets/svg/Sign_exponential.svg?url';

interface YieldConfigSectionProps {
	collectionData: CollectionDetailData;
}

const YieldConfigSectionComponent: FC<YieldConfigSectionProps> = ({ collectionData }) => {
	const { yieldSharePercentage, weightFunctionParameters } = collectionData;
	const [nftCount, setNftCount] = useState(1);

	// Calculate weight example using the CollectionService for consistency
	const weightExample = useMemo(() => {
		return CollectionService.calculateWeightFunctionExample(
			weightFunctionParameters.fnType,
			weightFunctionParameters.p1,
			weightFunctionParameters.p2,
			nftCount,
		);
	}, [weightFunctionParameters.fnType, weightFunctionParameters.p1, weightFunctionParameters.p2, nftCount]);

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
							<div className={css.weightFunctionHeader}>
								<Badge variant="info" size="medium">
									{weightFunctionParameters.fnType}
								</Badge>
								<img
									src={
										weightFunctionParameters.fnType === 'EXPONENTIAL'
											? SignExponentialIcon
											: SignLinearIcon
									}
									alt={`${weightFunctionParameters.fnType === 'EXPONENTIAL' ? 'Exponential' : 'Linear'} weight function`}
									className={css.weightFunctionIcon}
								/>
							</div>
							<div className={css.weightFunctionFormula}>
								<code>
									{CollectionService.formatDisplayFormula(
										weightFunctionParameters.fnType,
										weightFunctionParameters.p1,
										weightFunctionParameters.p2,
									)}
								</code>
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
							<div className={css.parameterValue}>{weightFunctionParameters.p1}</div>
							<div className={css.parameterDescription}>
								{weightFunctionParameters.fnType === 'LINEAR'
									? 'Base weight constant (intercept)'
									: 'Weight multiplier coefficient'}
							</div>
						</div>
						<div className={css.parameterItem}>
							<div className={css.parameterLabel}>Parameter 2 (p2)</div>
							<div className={css.parameterValue}>{weightFunctionParameters.p2}</div>
							<div className={css.parameterDescription}>
								{weightFunctionParameters.fnType === 'LINEAR'
									? 'NFT balance coefficient'
									: 'Exponential base for NFT count'}
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
								max="50"
								value={nftCount}
								onChange={(e) => setNftCount(parseInt(e.target.value))}
								className={css.slider}
							/>
							<div className={css.sliderRange}>
								<span>1</span>
								<span>50</span>
							</div>
						</div>
						<div className={css.exampleInput}>
							Input value: <code>{weightExample.input}</code>
						</div>
						<div className={css.exampleOutput}>
							Weight Multiplier: <code>{weightExample.multiplier}</code>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
};

export const YieldConfigSection = typedMemo(YieldConfigSectionComponent);
