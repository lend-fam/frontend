import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_DATA_RANGE = gql`
	query GetDataRange($cTokenMarket: String!) {
		earliest: ctokenAPYDatas(
			where: { cTokenMarket: $cTokenMarket }
			orderBy: "timestamp"
			orderDirection: "asc"
			first: 1
		) {
			timestamp
		}
		latest: ctokenAPYDatas(
			where: { cTokenMarket: $cTokenMarket }
			orderBy: "timestamp"
			orderDirection: "desc"
			first: 1
		) {
			timestamp
		}
		# Get total count to check data density
		totalCount: ctokenAPYDatas(where: { cTokenMarket: $cTokenMarket }, first: 1000) {
			id
		}
	}
`;

export interface DataRangeInfo {
	earliestTimestamp: number;
	latestTimestamp: number;
	totalRangeDays: number;
	totalDataPoints: number;
	availableRanges: string[];
	isRangeAvailable: (range: string) => boolean;
}

export const useDataRange = (cTokenMarket: string) => {
	const { data, loading, error } = useQuery(GET_DATA_RANGE, {
		variables: { cTokenMarket },
		skip: !cTokenMarket,
	});

	const dataRangeInfo = useMemo((): DataRangeInfo => {
		if (!data?.earliest?.[0] || !data?.latest?.[0]) {
			return {
				earliestTimestamp: 0,
				latestTimestamp: 0,
				totalRangeDays: 0,
				totalDataPoints: 0,
				availableRanges: [],
				isRangeAvailable: () => false,
			};
		}

		const earliestTimestamp = parseInt(data.earliest[0].timestamp) / 1000000; // Convert microseconds to seconds
		const latestTimestamp = parseInt(data.latest[0].timestamp) / 1000000;
		const totalRangeSeconds = latestTimestamp - earliestTimestamp;
		const totalRangeDays = totalRangeSeconds / (24 * 60 * 60);
		const totalDataPoints = data.totalCount?.length || 0;

		const availableRanges: string[] = [];

		// Check what time ranges have sufficient data
		// Use 80% of the required range as threshold to account for data gaps
		const ranges = [
			{ name: '24h', seconds: 86400 * 0.8, days: 1, label: '1 day' },
			{ name: '7d', seconds: 604800 * 0.8, days: 7, label: '7 days' },
			{ name: '30d', seconds: 2592000 * 0.8, days: 30, label: '30 days' },
			{ name: '90d', seconds: 7776000 * 0.8, days: 90, label: '90 days' },
			{ name: '1y', seconds: 31536000 * 0.8, days: 365, label: '1 year' },
		];

		ranges.forEach((range) => {
			// Check both time span and data density
			const hasEnoughTime = totalRangeSeconds >= range.seconds;

			// Minimum data points required for each range (to ensure chart quality)
			const minDataPoints: Record<string, number> = {
				'24h': 3, // At least 3 points for 24h
				'7d': 5, // At least 5 points for 7d
				'30d': 8, // At least 8 points for 30d
				'90d': 10, // At least 10 points for 90d
				'1y': 15, // At least 15 points for 1y
			};

			const hasEnoughData = totalDataPoints >= (minDataPoints[range.name] || 3);
			const isAvailable = hasEnoughTime && hasEnoughData;

			if (isAvailable) {
				availableRanges.push(range.name);
			}
		});

		const isRangeAvailable = (range: string): boolean => {
			return availableRanges.includes(range);
		};

		return {
			earliestTimestamp,
			latestTimestamp,
			totalRangeDays,
			totalDataPoints,
			availableRanges,
			isRangeAvailable,
		};
	}, [data, cTokenMarket]);

	return {
		dataRangeInfo,
		loading,
		error,
	};
};
