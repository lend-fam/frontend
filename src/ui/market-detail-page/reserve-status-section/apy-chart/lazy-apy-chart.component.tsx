import { type FC, Suspense, lazy } from 'react';
import { typedMemo } from '../../../../ui-kit/utils/typed-memo.utils';
import { type TimeRange } from '../../../../hooks/use-apy-chart-data.hook';

interface LazyAPYChartProps {
	cTokenMarket: string;
	timeRange: TimeRange;
	metric: 'supply' | 'borrow' | 'utilization';
	color: string;
	fallbackData?: Array<{ date: string; value: number }>;
}

// Lazy load the chart component to reduce initial bundle size
const EnhancedAPYChart = lazy(() =>
	import('./enhanced-apy-chart.component').then((module) => ({
		default: module.EnhancedAPYChart,
	})),
);

// Chart loading fallback component
const ChartLoadingFallback: FC = () => (
	<div
		style={{
			width: '100%',
			height: '145px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: '#f9fafb',
			borderRadius: '6px',
		}}>
		<div style={{ color: '#9ca3af', fontSize: '12px' }}>Loading chart...</div>
	</div>
);

export const LazyAPYChart: FC<LazyAPYChartProps> = typedMemo((props) => {
	return (
		<Suspense fallback={<ChartLoadingFallback />}>
			<EnhancedAPYChart {...props} />
		</Suspense>
	);
});

LazyAPYChart.displayName = 'LazyAPYChart';
