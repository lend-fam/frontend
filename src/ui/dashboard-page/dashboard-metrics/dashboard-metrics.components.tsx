import { memo, type FC } from 'react';

import css from './dashboard-metrics.module.css';

export const MarketsMetrics: FC = () => {
	return (
		<ul className={css.container}>
			<MarketsMetric label={'Net APY'} value={'4.15'} dimension="percent" />
			<MarketsMetric label={'Health Factor'} value={'1.90'} />
			<MarketsMetric label={'Borrow Usage'} value={'7.5'} dimension="percent" />
		</ul>
	);
};

interface MarketsMetricProps {
	label: string;
	value: string;
	dimension?: 'percent';
}

const MarketsMetric = memo<MarketsMetricProps>((props) => {
	const { label, value, dimension } = props;

	return (
		<li className={css.metric}>
			<p className={css.label}>{label}</p>
			<span className={css.value}>
				{value}
				{dimension && <span className={css.dimension}>{dimension === 'percent' ? '%' : ''}</span>}
			</span>
		</li>
	);
});

MarketsMetric.displayName = 'MarketsMetric';
