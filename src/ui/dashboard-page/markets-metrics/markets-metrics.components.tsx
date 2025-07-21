import { memo, type FC } from 'react';
import { usePortfolioMetrics } from '../../../hooks';

import css from './markets-metrics.module.css';

export const MarketsMetrics: FC = () => {
	const { data: metrics, isLoading } = usePortfolioMetrics();

	// Show default values immediately, update when loaded
	const displayMetrics = metrics || {
		netAPY: '0.00',
		healthFactor: '--',
		borrowUsage: '0.0',
		cumulativeLTV: '0.0',
	};

	return (
		<ul className={css.container}>
			<MarketsMetric label={'Net APY'} value={displayMetrics.netAPY} dimension="percent" isLoading={isLoading} />
			<MarketsMetric label={'Health Factor'} value={displayMetrics.healthFactor} isLoading={isLoading} />
			<MarketsMetric
				label={'Borrow Usage'}
				value={displayMetrics.borrowUsage}
				dimension="percent"
				isLoading={isLoading}
			/>
			<MarketsMetric
				label={'LTV'}
				value={displayMetrics.cumulativeLTV}
				dimension="percent"
				isLoading={isLoading}
			/>
		</ul>
	);
};

interface MarketsMetricProps {
	label: string;
	value: string;
	dimension?: 'percent';
	subtitle?: string;
	isLoading?: boolean;
}

const MarketsMetric = memo<MarketsMetricProps>((props) => {
	const { label, value, dimension, subtitle, isLoading } = props;

	return (
		<li className={css.metric}>
			<p className={css.label}>{label}</p>
			<span className={`${css.value} ${isLoading ? css.loading : ''}`}>
				{value}
				{dimension && <span className={css.dimension}>{dimension === 'percent' ? '%' : ''}</span>}
			</span>
			{subtitle && <p className={css.subtitle}>{subtitle}</p>}
		</li>
	);
});

MarketsMetric.displayName = 'MarketsMetric';
