import { useMemo } from 'react';
import type { Address } from 'viem';
import {
	usePythOracleInfo,
	usePythPriceFeedId,
	usePythPriceFeedHealth,
	useAssetFallbackInfo,
} from '../services/price.service';
import {
	determinePriceSource,
	calculateOracleHealth,
	formatPriceFeedId,
	getPythErrorMessage,
} from '../utils/pyth-oracle.utils';
import type { PriceSource, OracleHealthStatus } from '../constants/pyth-oracle.constants';
import { ORACLE_HEALTH_STATUS } from '../constants';

export interface PythOracleStatus {
	isLoading: boolean;
	error: string | null;
	oracleType: 'pyth' | 'simple' | 'unknown';
	pythInfo: {
		pythAddress?: Address;
		adminAddress?: Address;
		maxPriceAge?: bigint;
		maxPriceAgeFormatted?: string;
	};
	assetInfo: {
		priceFeedId?: string;
		priceFeedIdFormatted?: string;
		canGetPythPrice?: boolean;
		fallbackPrice?: bigint;
		useFallbackForced?: boolean;
	};
	priceSource: PriceSource;
	healthStatus: OracleHealthStatus;
	canBorrow: boolean;
	statusMessage: string;
}

export function usePythOracleStatus(assetAddress?: Address): PythOracleStatus {
	// Fetch Pyth oracle configuration
	const { data: oracleInfo, isLoading: isOracleInfoLoading, error: oracleInfoError } = usePythOracleInfo();

	// Fetch asset-specific price feed information
	const {
		data: priceFeedId,
		isLoading: isPriceFeedLoading,
		error: priceFeedError,
	} = usePythPriceFeedId(assetAddress!);

	// Check Pyth price feed health
	const {
		data: canGetPythPrice,
		isLoading: isHealthLoading,
		error: healthError,
	} = usePythPriceFeedHealth(priceFeedId || '');

	// Fetch fallback information
	const {
		data: fallbackInfo,
		isLoading: isFallbackLoading,
		error: fallbackError,
	} = useAssetFallbackInfo(assetAddress!);

	const status = useMemo((): PythOracleStatus => {
		const isLoading = isOracleInfoLoading || isPriceFeedLoading || isHealthLoading || isFallbackLoading;

		// Handle errors
		const error = oracleInfoError || priceFeedError || healthError || fallbackError;
		if (error) {
			const errorMessage = getPythErrorMessage('PYTH_NETWORK_UNAVAILABLE');
			return {
				isLoading,
				error: errorMessage,
				oracleType: 'unknown',
				pythInfo: {},
				assetInfo: {},
				priceSource: 'unavailable',
				healthStatus: ORACLE_HEALTH_STATUS.UNAVAILABLE,
				canBorrow: false,
				statusMessage: errorMessage,
			};
		}

		// Extract oracle info
		const pythAddress = oracleInfo?.[0]?.result as Address | undefined;
		const adminAddress = oracleInfo?.[1]?.result as Address | undefined;
		const maxPriceAge = oracleInfo?.[2]?.result as bigint | undefined;

		// Extract fallback info
		const fallbackPrice = fallbackInfo?.[0]?.result as bigint | undefined;
		const useFallbackForced = fallbackInfo?.[1]?.result as boolean | undefined;

		// Determine oracle type
		const oracleType = pythAddress ? 'pyth' : 'simple';

		// Determine price source
		const priceSource = determinePriceSource(
			priceFeedId,
			useFallbackForced,
			canGetPythPrice,
			true, // Assume we have oracle price for now
		);

		// Calculate health status
		const healthStatus = calculateOracleHealth(
			canGetPythPrice,
			maxPriceAge,
			// We don't have timestamp data in this example
			undefined,
			undefined,
		);

		// Determine if borrowing can proceed
		const canBorrow = healthStatus !== ORACLE_HEALTH_STATUS.UNAVAILABLE || priceSource === 'fallback';

		// Generate status message
		let statusMessage = 'Oracle status unknown';
		if (isLoading) {
			statusMessage = 'Loading oracle status...';
		} else if (priceSource === 'pyth' && healthStatus === ORACLE_HEALTH_STATUS.HEALTHY) {
			statusMessage = 'Pyth Network price feed active';
		} else if (priceSource === 'fallback') {
			statusMessage = useFallbackForced
				? 'Using fallback price (forced)'
				: 'Using fallback price (Pyth unavailable)';
		} else if (priceSource === 'unavailable') {
			statusMessage = 'Price feed unavailable';
		} else if (healthStatus === ORACLE_HEALTH_STATUS.DEGRADED) {
			statusMessage = 'Price feed degraded';
		}

		return {
			isLoading,
			error: null,
			oracleType,
			pythInfo: {
				pythAddress,
				adminAddress,
				maxPriceAge,
				maxPriceAgeFormatted: maxPriceAge ? formatDuration(Number(maxPriceAge)) : undefined,
			},
			assetInfo: {
				priceFeedId,
				priceFeedIdFormatted: priceFeedId ? formatPriceFeedId(priceFeedId) : 'Not configured',
				canGetPythPrice,
				fallbackPrice,
				useFallbackForced,
			},
			priceSource,
			healthStatus,
			canBorrow,
			statusMessage,
		};
	}, [
		isOracleInfoLoading,
		isPriceFeedLoading,
		isHealthLoading,
		isFallbackLoading,
		oracleInfo,
		priceFeedId,
		canGetPythPrice,
		fallbackInfo,
		oracleInfoError,
		priceFeedError,
		healthError,
		fallbackError,
	]);

	return status;
}

// Helper function for formatting duration (moved here to avoid circular imports)
function formatDuration(seconds: number): string {
	if (seconds < 60) return `${seconds}s`;
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
	return `${Math.floor(seconds / 86400)}d`;
}
