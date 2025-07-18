import { useMemo } from 'react';
import { useHistoricalAPY, type TimeRange } from './use-historical-apy.hook';

export interface APYChartDataPoint {
	timestamp: number;
	supply: number;
	borrow: number;
	utilization: number;
	date: string;
}

export interface UseAPYChartDataOptions {
	cTokenMarket: string;
	timeRange: TimeRange;
	metric: 'supply' | 'borrow' | 'utilization';
}

export type { TimeRange };

export const useAPYChartData = ({ cTokenMarket, timeRange, metric }: UseAPYChartDataOptions) => {
	const {
		data: historicalData,
		loading,
		error,
	} = useHistoricalAPY({
		cTokenMarket,
		timeRange,
	});

	const chartData = useMemo(() => {
		if (!historicalData?.length) return [];

		return historicalData.map((point): APYChartDataPoint => {
			const date = new Date(point.timestamp * 1000);
			let dateString: string;

			switch (timeRange) {
				case '24h':
					dateString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
					break;
				case '7d':
					dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
					break;
				case '30d':
				case '90d':
					dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
					break;
				case '1y':
					dateString = date.toLocaleDateString([], { month: 'short', year: '2-digit' });
					break;
				default:
					dateString = date.toLocaleDateString();
			}

			return {
				timestamp: point.timestamp,
				supply: point.supplyAPY,
				borrow: point.borrowAPY,
				utilization: point.utilizationRate,
				date: dateString,
			};
		});
	}, [historicalData, timeRange]);

	const currentValue = useMemo(() => {
		if (!chartData.length) return 0;
		const latest = chartData[chartData.length - 1];
		return latest[metric];
	}, [chartData, metric]);

	const change24h = useMemo(() => {
		if (chartData.length < 2) return 0;
		const latest = chartData[chartData.length - 1];
		const previous = chartData[chartData.length - 2];
		return latest[metric] - previous[metric];
	}, [chartData, metric]);

	const percentageChange = useMemo(() => {
		if (chartData.length < 2) return 0;
		const latest = chartData[chartData.length - 1];
		const previous = chartData[chartData.length - 2];
		if (previous[metric] === 0) return 0;
		return ((latest[metric] - previous[metric]) / previous[metric]) * 100;
	}, [chartData, metric]);

	return {
		data: chartData,
		loading,
		error,
		currentValue,
		change24h,
		percentageChange,
		metric,
		timeRange,
	};
};
