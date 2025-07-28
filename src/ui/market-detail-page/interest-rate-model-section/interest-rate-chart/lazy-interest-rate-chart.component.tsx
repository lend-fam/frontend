import { type FC, Suspense, lazy } from 'react';
import { typedMemo } from '../../../../ui-kit/utils/typed-memo.utils';

interface LazyInterestRateChartProps {
	currentRate: number;
	currentUtilization: number;
	interestRateParams?: {
		baseRateAPY: number;
		multiplierAPY: number;
		jumpMultiplierAPY?: number;
		kinkUtilization?: number;
		modelType: string;
	};
}

// Lazy load the interest rate chart component to reduce initial bundle size
const InterestRateChart = lazy(() =>
	import('./interest-rate-chart.component').then((module) => ({
		default: module.InterestRateChart,
	})),
);

// Chart loading fallback component
const InterestRateChartLoadingFallback: FC = () => (
	<div
		style={{
			width: '100%',
			height: '240px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: '#f9fafb',
			borderRadius: '8px',
			border: '1px solid #E0E0E0',
		}}>
		<div style={{ color: '#9ca3af', fontSize: '12px' }}>Loading interest rate chart...</div>
	</div>
);

export const LazyInterestRateChart: FC<LazyInterestRateChartProps> = typedMemo((props) => {
	return (
		<Suspense fallback={<InterestRateChartLoadingFallback />}>
			<InterestRateChart {...props} />
		</Suspense>
	);
});

LazyInterestRateChart.displayName = 'LazyInterestRateChart';
