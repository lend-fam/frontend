import { type FC } from 'react';
import { typedMemo } from '../../../utils/typed-memo.utils';
import { useTheme } from '../../../hooks/use-theme.hook';

import css from './transaction-progress.module.css';

export interface TransactionStep {
	id: string;
	title: string;
	description: string;
	state: 'pending' | 'confirming' | 'success' | 'error';
	error?: string;
}

interface TransactionProgressProps {
	steps: TransactionStep[];
	theme?: Partial<typeof css>;
}

const TransactionProgressComponent: FC<TransactionProgressProps> = ({ steps, theme: themeOverride }) => {
	const theme = useTheme(css, themeOverride);

	if (steps.length === 0) {
		return null;
	}

	return (
		<div className={theme.container}>
			<h3 className={theme.title}>Transaction Progress</h3>
			<div className={theme.progressContainer}>
				{steps.map((step, index) => (
					<div key={step.id} className={theme.progressStep}>
						<div className={`${theme.stepIndicator} ${theme[step.state]}`}>
							{step.state === 'success' ? '✓' : index + 1}
						</div>
						<div className={theme.stepInfo}>
							<div className={theme.stepTitle}>{step.title}</div>
							<div className={theme.stepDescription}>{step.description}</div>
							{step.state === 'error' && step.error && (
								<div className={theme.stepError}>{step.error}</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export const TransactionProgress = typedMemo(TransactionProgressComponent);
