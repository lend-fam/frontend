// Import types as needed
import type { ReadContractErrorType } from '@wagmi/core';
import {
	PYTH_ORACLE_ERRORS,
	PYTH_ERROR_MESSAGES,
	ORACLE_TYPES,
	ORACLE_HEALTH_STATUS,
	ORACLE_HEALTH_THRESHOLDS,
	type PythOracleErrorReason,
	type OracleType,
	type OracleHealthStatus,
	type PriceSource,
} from '../constants/pyth-oracle.constants';

/**
 * Detects if an oracle is a Pyth oracle by checking for Pyth-specific functions
 * This is a utility function that would be used with contract reads
 */
export function detectOracleType(
	hasPythFunction?: boolean,
	hasAdminFunction?: boolean,
	hasFallbackFunction?: boolean,
): OracleType {
	if (hasPythFunction && hasAdminFunction && hasFallbackFunction) {
		return ORACLE_TYPES.PYTH;
	}
	if (hasPythFunction === false) {
		return ORACLE_TYPES.SIMPLE;
	}
	return ORACLE_TYPES.UNKNOWN;
}

/**
 * Parses contract error to determine if it's a Pyth oracle specific error
 */
export function parsePythOracleError(error: ReadContractErrorType | Error): PythOracleErrorReason | null {
	const errorMessage = error?.message || '';

	// Check for specific Pyth oracle errors
	if (errorMessage.includes(PYTH_ORACLE_ERRORS.Unauthorized)) {
		return 'PYTH_ORACLE_UNAUTHORIZED';
	}
	if (errorMessage.includes(PYTH_ORACLE_ERRORS.PriceNotAvailable)) {
		return 'PYTH_PRICE_NOT_AVAILABLE';
	}
	if (errorMessage.includes(PYTH_ORACLE_ERRORS.PriceStale)) {
		return 'PYTH_PRICE_STALE';
	}
	if (errorMessage.includes(PYTH_ORACLE_ERRORS.InvalidPriceFeedId)) {
		return 'PYTH_INVALID_PRICE_FEED';
	}
	if (errorMessage.includes(PYTH_ORACLE_ERRORS.InvalidPrice)) {
		return 'PYTH_INVALID_PRICE';
	}

	// Check for network-level issues
	if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
		return 'PYTH_NETWORK_UNAVAILABLE';
	}

	return null;
}

/**
 * Gets user-friendly error message for Pyth oracle errors
 */
export function getPythErrorMessage(errorReason: PythOracleErrorReason): string {
	return PYTH_ERROR_MESSAGES[errorReason] || 'Unknown oracle error';
}

/**
 * Determines price source based on oracle state
 */
export function determinePriceSource(
	priceFeedId?: string,
	useFallbackForced?: boolean,
	canGetPythPrice?: boolean,
	hasOraclePrice?: boolean,
): PriceSource {
	// No price feed configured - can only use fallback
	if (!priceFeedId || priceFeedId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
		return 'fallback';
	}

	// Fallback is forced
	if (useFallbackForced) {
		return 'fallback';
	}

	// Pyth is available and we have price data
	if (canGetPythPrice === true && hasOraclePrice) {
		return 'pyth';
	}

	// Pyth is not available but we might have fallback
	if (canGetPythPrice === false) {
		return 'fallback';
	}

	// Unknown state
	return 'unavailable';
}

/**
 * Calculates oracle health status based on various factors
 */
export function calculateOracleHealth(
	canGetPythPrice?: boolean,
	maxPriceAge?: bigint,
	lastUpdateTimestamp?: bigint,
	currentTimestamp?: bigint,
): OracleHealthStatus {
	// If we can't get Pyth price at all, it's unavailable
	if (canGetPythPrice === false) {
		return ORACLE_HEALTH_STATUS.UNAVAILABLE;
	}

	// If we don't have timing data, assume healthy if Pyth is available
	if (!lastUpdateTimestamp || !currentTimestamp || !maxPriceAge) {
		return canGetPythPrice === true ? ORACLE_HEALTH_STATUS.HEALTHY : ORACLE_HEALTH_STATUS.UNAVAILABLE;
	}

	const ageInSeconds = Number(currentTimestamp - lastUpdateTimestamp);
	const maxAgeInSeconds = Number(maxPriceAge);

	// Check if price exceeds configured max age
	if (ageInSeconds > maxAgeInSeconds) {
		return ORACLE_HEALTH_STATUS.UNAVAILABLE;
	}

	// Check if price is getting stale (approaching max age)
	if (ageInSeconds > maxAgeInSeconds * 0.8) {
		return ORACLE_HEALTH_STATUS.DEGRADED;
	}

	// Check against our own thresholds
	if (ageInSeconds > ORACLE_HEALTH_THRESHOLDS.UNAVAILABLE_AGE_THRESHOLD) {
		return ORACLE_HEALTH_STATUS.UNAVAILABLE;
	}

	if (ageInSeconds > ORACLE_HEALTH_THRESHOLDS.DEGRADED_AGE_THRESHOLD) {
		return ORACLE_HEALTH_STATUS.DEGRADED;
	}

	return ORACLE_HEALTH_STATUS.HEALTHY;
}

/**
 * Validates price feed ID format
 */
export function isValidPriceFeedId(priceFeedId?: string): boolean {
	if (!priceFeedId) return false;

	// Should be 32 bytes hex string (66 characters with 0x prefix)
	if (!/^0x[a-fA-F0-9]{64}$/.test(priceFeedId)) return false;

	// Should not be zero
	if (priceFeedId === '0x0000000000000000000000000000000000000000000000000000000000000000') return false;

	return true;
}

/**
 * Formats price feed ID for display
 */
export function formatPriceFeedId(priceFeedId?: string): string {
	if (!isValidPriceFeedId(priceFeedId)) {
		return 'Not configured';
	}

	// Show first 10 and last 8 characters
	return `${priceFeedId!.slice(0, 10)}...${priceFeedId!.slice(-8)}`;
}

/**
 * Converts seconds to human-readable duration
 */
export function formatDuration(seconds: number): string {
	if (seconds < 60) return `${seconds}s`;
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
	return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

/**
 * Gets appropriate action text based on oracle state
 */
export function getOracleActionText(
	healthStatus: OracleHealthStatus,
	priceSource: PriceSource,
	canBorrow: boolean = true,
): string {
	if (!canBorrow) {
		return 'Cannot Borrow';
	}

	switch (healthStatus) {
		case ORACLE_HEALTH_STATUS.UNAVAILABLE:
			return priceSource === 'fallback' ? 'Using Fallback Price' : 'Price Unavailable';
		case ORACLE_HEALTH_STATUS.DEGRADED:
			return 'Price Data Stale';
		case ORACLE_HEALTH_STATUS.HEALTHY:
		default:
			return 'Borrow';
	}
}

/**
 * Determines if borrowing should be allowed based on oracle health
 */
export function canBorrowWithOracleState(
	healthStatus: OracleHealthStatus,
	priceSource: PriceSource,
	allowFallbackBorrowing: boolean = true,
): boolean {
	// Always allow if oracle is healthy
	if (healthStatus === ORACLE_HEALTH_STATUS.HEALTHY) {
		return true;
	}

	// Allow degraded if we have a price source
	if (healthStatus === ORACLE_HEALTH_STATUS.DEGRADED) {
		return priceSource !== 'unavailable';
	}

	// For unavailable oracle, only allow if fallback is permitted and available
	if (healthStatus === ORACLE_HEALTH_STATUS.UNAVAILABLE) {
		return allowFallbackBorrowing && priceSource === 'fallback';
	}

	return false;
}
