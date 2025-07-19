import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_CTOKEN_APY_DATA_DEBUG = gql`
	query GetCTokenAPYDataDebug($cTokenMarket: String!) {
		ctokenAPYDatas(
			where: { cTokenMarket: $cTokenMarket }
			orderBy: "timestamp"
			orderDirection: "desc"
			first: 50
		) {
			id
			timestamp
			cTokenMarket
			interval
			supplyAPY
			borrowAPY
			utilizationRate
			totalSupply
			totalBorrows
			exchangeRate
			blockNumber
		}
	}
`;

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

export const useHistoricalAPYDebug = ({ cTokenMarket, timeRange }: UseHistoricalAPYOptions) => {
	// All data query removed - not used in production

	const { data, loading, error } = useQuery(GET_CTOKEN_APY_DATA_DEBUG, {
		variables: { cTokenMarket },
		skip: !cTokenMarket,
		errorPolicy: 'all',
	});

	const historicalData = useMemo(() => {
		if (!data?.ctokenAPYDatas) return [];

		return data.ctokenAPYDatas.map(
			(apyData: {
				timestamp: string;
				supplyAPY: string;
				borrowAPY: string;
				utilizationRate: string;
				exchangeRate: string;
			}): HistoricalAPYData => ({
				timestamp: parseInt(apyData.timestamp) / 1000000, // Convert microseconds to seconds
				supplyAPY: parseFloat(apyData.supplyAPY) / 1e18,
				borrowAPY: parseFloat(apyData.borrowAPY) / 1e18,
				utilizationRate: parseFloat(apyData.utilizationRate) / 1e18,
				exchangeRate: parseFloat(apyData.exchangeRate) / 1e18,
			}),
		);
	}, [data]);

	const mockData = useMemo(() => {
		const baseAPY = 0.05;
		const points = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
		const now = Math.floor(Date.now() / 1000);

		return Array.from({ length: points }, (_, i) => ({
			timestamp: now - (points - i) * (timeRange === '24h' ? 3600 : 86400),
			supplyAPY: baseAPY + (Math.random() - 0.5) * 0.02,
			borrowAPY: baseAPY * 1.5 + (Math.random() - 0.5) * 0.03,
			utilizationRate: 0.7 + (Math.random() - 0.5) * 0.3,
			exchangeRate: 1.0 + (Math.random() - 0.5) * 0.1,
		}));
	}, [timeRange]);

	// Debug hook - console logs removed for production

	return {
		data: historicalData.length > 0 ? historicalData : mockData,
		loading,
		error,
		timeRange,
		isMockData: historicalData.length === 0,
	};
};

export const useLatestAPYStatsDebug = (cTokenMarket: string) => {
	const { data, loading, error } = useQuery(GET_CTOKEN_APY_DATA_DEBUG, {
		variables: { cTokenMarket },
		skip: !cTokenMarket,
		errorPolicy: 'all',
	});

	const latestStats = useMemo(() => {
		if (!data?.ctokenAPYDatas?.[0]) {
			return {
				timestamp: Math.floor(Date.now() / 1000),
				supplyAPY: 0.05,
				borrowAPY: 0.075,
				utilizationRate: 0.7,
				exchangeRate: 1.0,
			};
		}

		const apyData = data.ctokenAPYDatas[0];
		return {
			timestamp: parseInt(apyData.timestamp) / 1000000, // Convert microseconds to seconds
			supplyAPY: parseFloat(apyData.supplyAPY) / 1e18,
			borrowAPY: parseFloat(apyData.borrowAPY) / 1e18,
			utilizationRate: parseFloat(apyData.utilizationRate) / 1e18,
			exchangeRate: parseFloat(apyData.exchangeRate) / 1e18,
		};
	}, [data]);

	// Debug hook - console logs removed for production

	return {
		data: latestStats,
		loading,
		error,
		isMockData: !data?.ctokenAPYDatas?.[0],
	};
};
