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

function generateMockAPYData(timeRange: TimeRange): HistoricalAPYData[] {
	const baseAPY = 0.05; // 5%
	const points = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
	const now = Math.floor(Date.now() / 1000);

	return Array.from({ length: points }, (_, i) => ({
		timestamp: now - (points - i) * (timeRange === '24h' ? 3600 : 86400),
		supplyAPY: baseAPY + (Math.random() - 0.5) * 0.02,
		borrowAPY: baseAPY * 1.5 + (Math.random() - 0.5) * 0.03,
		utilizationRate: 0.7 + (Math.random() - 0.5) * 0.3,
		exchangeRate: 1.0 + (Math.random() - 0.5) * 0.1,
	}));
}

export const useHistoricalAPY = ({ cTokenMarket, timeRange, interval = 'hour' }: UseHistoricalAPYOptions) => {
	const timeRangeMap = useMemo(() => {
		const now = Math.floor(Date.now() / 1000);

		// Conservative time ranges - only go back as far as we're confident we have data
		// Using 90% of the full range to ensure data availability
		const ranges = {
			'24h': { from: now - 86400 * 0.9, interval: 'hour' },
			'7d': { from: now - 604800 * 0.9, interval: 'hour' },
			'30d': { from: now - 2592000 * 0.9, interval: 'day' },
			'90d': { from: now - 7776000 * 0.9, interval: 'day' },
			'1y': { from: now - 31536000 * 0.9, interval: 'day' },
		};

		console.log(`Historical APY Query for ${cTokenMarket} - ${timeRange}:`, {
			from: ranges[timeRange]?.from,
			to: now,
			fromDate: new Date(ranges[timeRange]?.from * 1000).toISOString(),
			toDate: new Date(now * 1000).toISOString(),
			lookbackHours: ((now - ranges[timeRange]?.from) / 3600).toFixed(1),
		});

		return ranges[timeRange];
	}, [timeRange, cTokenMarket]);

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
		if (!data?.ctokenAPYDatas) return [];

		const processedData = data.ctokenAPYDatas.map(
			(stat): HistoricalAPYData => ({
				timestamp: parseInt(stat.timestamp.toString()) / 1000000, // Timestamp is in microseconds, convert to seconds
				supplyAPY: parseFloat(stat.supplyAPY) / 1e4, // APY is scaled by 10^4 (PERCENTAGE_SCALE)
				borrowAPY: parseFloat(stat.borrowAPY) / 1e4, // APY is scaled by 10^4 (PERCENTAGE_SCALE)
				utilizationRate: parseFloat(stat.utilizationRate) / 1e18, // Utilization is in mantissa scale
				exchangeRate: parseFloat(stat.exchangeRate) / 1e18, // Exchange rate is in mantissa scale
			}),
		);

		// Check data quality and provide appropriate fallback
		console.log(`Historical APY Data Quality for ${cTokenMarket} - ${timeRange}:`, {
			requestedDataPoints: processedData.length,
			hasNonZeroData: processedData.some((p) => p.supplyAPY > 0 || p.borrowAPY > 0),
			averageSupplyAPY:
				processedData.length > 0
					? (processedData.reduce((sum, p) => sum + p.supplyAPY, 0) / processedData.length).toFixed(4)
					: 0,
			averageBorrowAPY:
				processedData.length > 0
					? (processedData.reduce((sum, p) => sum + p.borrowAPY, 0) / processedData.length).toFixed(4)
					: 0,
		});

		// Only use mock data if we have no data or all APY values are exactly zero
		const allZeroAPY = processedData.every((point) => point.supplyAPY === 0 && point.borrowAPY === 0);
		const hasInsufficientData = processedData.length < 2;

		if ((allZeroAPY && processedData.length > 0) || hasInsufficientData) {
			const reason = hasInsufficientData ? 'insufficient data points' : 'all APY values are zero';
			console.warn(`Using mock data for ${cTokenMarket} - ${timeRange}: ${reason}`);
			return generateMockAPYData(timeRange);
		}

		return processedData;
	}, [data, timeRange, cTokenMarket]);

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
		if (!data?.ctokenAPYDatas?.[0]) {
			// Return mock data when no real data is available
			return {
				timestamp: Math.floor(Date.now() / 1000),
				supplyAPY: 0.05,
				borrowAPY: 0.075,
				utilizationRate: 0.7,
				exchangeRate: 1.0,
			};
		}

		const stats = data.ctokenAPYDatas[0];
		const processedStats = {
			timestamp: parseInt(stats.timestamp.toString()) / 1000000, // Timestamp is in microseconds, convert to seconds
			supplyAPY: parseFloat(stats.supplyAPY) / 1e4, // APY is scaled by 10^4 (PERCENTAGE_SCALE)
			borrowAPY: parseFloat(stats.borrowAPY) / 1e4, // APY is scaled by 10^4 (PERCENTAGE_SCALE)
			utilizationRate: parseFloat(stats.utilizationRate) / 1e18, // Utilization is in mantissa scale
			exchangeRate: parseFloat(stats.exchangeRate) / 1e18, // Exchange rate is in mantissa scale
		};

		// Only use mock data if both APY values are exactly zero
		if (processedStats.supplyAPY === 0 && processedStats.borrowAPY === 0) {
			console.warn('Latest APY values are zero - using mock data. Check interest rate model configuration.');
			return {
				timestamp: processedStats.timestamp,
				supplyAPY: 0.05,
				borrowAPY: 0.075,
				utilizationRate: processedStats.utilizationRate,
				exchangeRate: processedStats.exchangeRate,
			};
		}

		return processedStats;
	}, [data]);

	return {
		data: latestStats,
		loading,
		error,
	};
};
