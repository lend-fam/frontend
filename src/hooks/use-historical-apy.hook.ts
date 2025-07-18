import { useMemo } from 'react';
import { useGetHistoricalApyQuery, useGetLatestApyStatsQuery } from '../graphql/generated';

export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y';

export interface HistoricalAPYData {
	timestamp: number;
	supplyAPY: number;
	borrowAPY: number;
	utilizationRate: number;
	exchangeRate: number;
}

export interface UseHistoricalAPYOptions {
	cTokenMarket: string;
	timeRange: TimeRange;
	interval?: 'hour' | 'day';
}

export const useHistoricalAPY = ({ cTokenMarket, timeRange, interval = 'hour' }: UseHistoricalAPYOptions) => {
	const timeRangeMap = useMemo(() => {
		const now = Math.floor(Date.now() / 1000);
		const ranges = {
			'24h': { from: now - 86400, interval: 'hour' },
			'7d': { from: now - 604800, interval: 'hour' },
			'30d': { from: now - 2592000, interval: 'day' },
			'90d': { from: now - 7776000, interval: 'day' },
			'1y': { from: now - 31536000, interval: 'day' },
		};
		return ranges[timeRange];
	}, [timeRange]);

	const { data, loading, error } = useGetHistoricalApyQuery({
		variables: {
			cTokenMarket,
			from: timeRangeMap.from,
			to: Math.floor(Date.now() / 1000),
			interval: interval || timeRangeMap.interval,
		},
		skip: !cTokenMarket,
	});

	const historicalData = useMemo(() => {
		if (!data?.apyStats) return [];

		return data.apyStats.map(
			(stat): HistoricalAPYData => ({
				timestamp: stat.timestamp,
				supplyAPY: parseFloat(stat.supplyAPY_last) / 1e18,
				borrowAPY: parseFloat(stat.borrowAPY_last) / 1e18,
				utilizationRate: parseFloat(stat.utilizationRate_last) / 1e18,
				exchangeRate: parseFloat(stat.exchangeRate_last) / 1e18,
			}),
		);
	}, [data]);

	return {
		data: historicalData,
		loading,
		error,
		timeRange,
	};
};

export const useLatestAPYStats = (cTokenMarket: string) => {
	const { data, loading, error } = useGetLatestApyStatsQuery({
		variables: { cTokenMarket },
		skip: !cTokenMarket,
	});

	const latestStats = useMemo(() => {
		if (!data?.apyStats?.[0]) return null;

		const stats = data.apyStats[0];
		return {
			timestamp: stats.timestamp,
			supplyAPY: parseFloat(stats.supplyAPY_last) / 1e18,
			borrowAPY: parseFloat(stats.borrowAPY_last) / 1e18,
			utilizationRate: parseFloat(stats.utilizationRate_last) / 1e18,
			exchangeRate: parseFloat(stats.exchangeRate_last) / 1e18,
		};
	}, [data]);

	return {
		data: latestStats,
		loading,
		error,
	};
};
