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
	}
`;

export interface DataRangeInfo {
	earliestTimestamp: number;
	latestTimestamp: number;
	totalRangeDays: number;
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
				availableRanges: [],
				isRangeAvailable: () => false,
			};
		}

		const earliestTimestamp = parseInt(data.earliest[0].timestamp) / 1000000; // Convert microseconds to seconds
		const latestTimestamp = parseInt(data.latest[0].timestamp) / 1000000;
		const totalRangeSeconds = latestTimestamp - earliestTimestamp;
		const totalRangeDays = totalRangeSeconds / (24 * 60 * 60);

		const availableRanges: string[] = [];
		
		// Check what time ranges have sufficient data
		if (totalRangeSeconds >= 86400) availableRanges.push('24h'); // 1 day
		if (totalRangeSeconds >= 604800) availableRanges.push('7d'); // 7 days
		if (totalRangeSeconds >= 2592000) availableRanges.push('30d'); // 30 days
		if (totalRangeSeconds >= 7776000) availableRanges.push('90d'); // 90 days
		if (totalRangeSeconds >= 31536000) availableRanges.push('1y'); // 1 year

		const isRangeAvailable = (range: string): boolean => {
			return availableRanges.includes(range);
		};

		return {
			earliestTimestamp,
			latestTimestamp,
			totalRangeDays,
			availableRanges,
			isRangeAvailable,
		};
	}, [data]);

	return {
		dataRangeInfo,
		loading,
		error,
	};
};