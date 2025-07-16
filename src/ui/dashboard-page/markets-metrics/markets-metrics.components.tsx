import { memo, type FC } from 'react';
import { usePortfolioMetrics } from '../../../hooks';

import css from './markets-metrics.module.css';

export const MarketsMetrics: FC = () => {
	const { data: metrics, isLoading } = usePortfolioMetrics();

	if (isLoading) {
		return (
			<ul className={css.container}>
				<MarketsMetric label={'Net APY'} value={'--'} dimension="percent" />
				<MarketsMetric label={'Health Factor'} value={'--'} />
				<MarketsMetric label={'Borrow Usage'} value={'--'} dimension="percent" />
				<MarketsMetric label={'LTV'} value={'--'} dimension="percent" />
			</ul>
		);
	}

	if (!metrics) {
		return (
			<ul className={css.container}>
				<MarketsMetric label={'Net APY'} value={'0.00'} dimension="percent" />
				<MarketsMetric label={'Health Factor'} value={'--'} />
				<MarketsMetric label={'Borrow Usage'} value={'0.0'} dimension="percent" />
				<MarketsMetric label={'LTV'} value={'0.0'} dimension="percent" />
			</ul>
		);
	}

	return (
		<ul className={css.container}>
			<MarketsMetric label={'Net APY'} value={metrics.netAPY} dimension="percent" />
			<MarketsMetric label={'Health Factor'} value={metrics.healthFactor} />
			<MarketsMetric label={'Borrow Usage'} value={metrics.borrowUsage} dimension="percent" />
			<MarketsMetric label={'LTV'} value={metrics.cumulativeLTV} dimension="percent" />
		</ul>
	);
};

interface MarketsMetricProps {
	label: string;
	value: string;
	dimension?: 'percent';
	subtitle?: string;
}

const MarketsMetric = memo<MarketsMetricProps>((props) => {
	const { label, value, dimension, subtitle } = props;

	return (
		<li className={css.metric}>
			<p className={css.label}>{label}</p>
			<span className={css.value}>
				{value}
				{dimension && <span className={css.dimension}>{dimension === 'percent' ? '%' : ''}</span>}
			</span>
			{subtitle && <p className={css.subtitle}>{subtitle}</p>}
		</li>
	);
});

MarketsMetric.displayName = 'MarketsMetric';
