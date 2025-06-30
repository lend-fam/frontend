import { memo, type FC } from 'react';

import css from './dashboard-metrics.module.css';

export const DashboardMetrics: FC = () => {
	return (
		<ul className={css.container}>
			<DashboardMetric label={'Net APY'} value={'4.15'} dimension="percent" />
			<DashboardMetric label={'Health Factor'} value={'1.90'} />
			<DashboardMetric label={'Borrow Usage'} value={'7.5'} dimension="percent" />
		</ul>
	);
};

interface DashboardMetricProps {
	label: string;
	value: string;
	dimension?: 'percent';
}

const DashboardMetric = memo<DashboardMetricProps>((props) => {
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

DashboardMetric.displayName = 'DashboardMetric';
