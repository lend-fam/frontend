import { type FC, useState, useMemo, useEffect } from 'react';
import { Card } from '../../../ui-kit/components/card/card.component';
import { SectionHeader } from '../../../ui-kit/components/section-header/section-header.component';
import { typedMemo } from '../../../ui-kit/utils/typed-memo.utils';
import { CollectionService } from '../../../services/collection.service';
import type { CollectionDetailData } from '../collection-detail-page.component';

import css from './yield-config-section.module.css';

interface YieldConfigSectionProps {
	collectionData: CollectionDetailData;
}

const YieldConfigSectionComponent: FC<YieldConfigSectionProps> = ({ collectionData }) => {
	const { weightFunctionParameters, nftMultiplier } = collectionData;

	// Get user's actual NFT count for display (can be 0)
	const userNftCount = useMemo(() => {
		return nftMultiplier !== null && nftMultiplier !== undefined ? nftMultiplier : 0;
	}, [nftMultiplier]);

	// NFT count for calculation (minimum 1 for the slider)
	const [nftCount, setNftCount] = useState(Math.max(userNftCount, 1));

	// Update nftCount when userNftCount changes (e.g., when data loads)
	useEffect(() => {
		setNftCount(Math.max(userNftCount, 1));
	}, [userNftCount]);

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
				<SectionHeader title="Example Calculation" className={css.exampleHeader} />

				<div className={css.exampleContainer}>
					<div className={css.sliderContainer}>
						<div className={css.sliderHeader}>
							<div className={css.sliderLabel}>
								NFT Count: <strong>{nftCount}</strong>{' '}
								<span className={css.userBalance}>(your balance: {userNftCount})</span>
							</div>
							<button
								type="button"
								onClick={() => setNftCount(Math.max(userNftCount, 1))}
								className={css.resetButton}
								title={`Reset to your NFT count (${userNftCount})`}>
								Reset
							</button>
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
		</Card>
	);
};

export const YieldConfigSection = typedMemo(YieldConfigSectionComponent);
