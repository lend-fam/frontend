export const HEALTH_FACTOR_CONSTANTS = {
	SAFE_THRESHOLD: 1.2,
	CRITICAL_THRESHOLD: 1.1,
	LIQUIDATION_THRESHOLD: 1.0,
	SAFETY_BUFFER: 0.01,
} as const;

export const HEALTH_FACTOR_RISK_LEVELS = {
	SAFE: 'safe',
	MODERATE: 'moderate',
	HIGH: 'high',
	CRITICAL: 'critical',
} as const;

export type HealthFactorRiskLevel = (typeof HEALTH_FACTOR_RISK_LEVELS)[keyof typeof HEALTH_FACTOR_RISK_LEVELS];

/**
 * Format health factor for display
 */
export function formatHealthFactor(healthFactor: string): string {
	if (healthFactor === '∞' || healthFactor === 'Infinity') {
		return '∞';
	}

	const factor = parseFloat(healthFactor);
	if (isNaN(factor)) {
		return '∞';
	}

	return factor.toFixed(2);
}

/**
 * Get health factor color class based on risk level
 */
export function getHealthFactorColorClass(healthFactor: string): string {
	if (healthFactor === '∞') return 'health-factor-safe';

	const factor = parseFloat(healthFactor);
	if (isNaN(factor)) return 'health-factor-safe';

	if (factor >= 2.0) return 'health-factor-safe';
	if (factor >= HEALTH_FACTOR_CONSTANTS.SAFE_THRESHOLD) return 'health-factor-moderate';
	if (factor >= HEALTH_FACTOR_CONSTANTS.CRITICAL_THRESHOLD) return 'health-factor-high';
	return 'health-factor-critical';
}

/**
 * Get health factor risk description
 */
export function getHealthFactorDescription(healthFactor: string): string {
	if (healthFactor === '∞') {
		return 'No borrowing risk - you have no outstanding loans';
	}

	const factor = parseFloat(healthFactor);
	if (isNaN(factor)) {
		return 'Unable to calculate health factor';
	}

	if (factor >= 2.0) {
		return 'Very safe - low liquidation risk';
	} else if (factor >= HEALTH_FACTOR_CONSTANTS.SAFE_THRESHOLD) {
		return 'Safe - moderate liquidation risk';
	} else if (factor >= HEALTH_FACTOR_CONSTANTS.CRITICAL_THRESHOLD) {
		return 'High risk - close to liquidation threshold';
	} else {
		return 'Critical - at risk of liquidation';
	}
}

/**
 * Check if health factor indicates liquidation risk
 */
export function isLiquidationRisk(
	healthFactor: string,
	threshold = HEALTH_FACTOR_CONSTANTS.CRITICAL_THRESHOLD,
): boolean {
	if (healthFactor === '∞') return false;

	const factor = parseFloat(healthFactor);
	if (isNaN(factor)) return false;

	return factor < threshold;
}

/**
 * Calculate health factor change direction and magnitude
 */
export function analyzeHealthFactorChange(
	current: string,
	new_: string,
): {
	direction: 'improving' | 'declining' | 'stable';
	magnitude: 'small' | 'moderate' | 'large';
	risk: HealthFactorRiskLevel;
} {
	if (current === new_) {
		return {
			direction: 'stable',
			magnitude: 'small',
			risk: getHealthFactorRisk(new_),
		};
	}

	if (current === '∞' || new_ === '∞') {
		return {
			direction: new_ === '∞' ? 'improving' : 'declining',
			magnitude: 'large',
			risk: getHealthFactorRisk(new_),
		};
	}

	const currentFactor = parseFloat(current);
	const newFactor = parseFloat(new_);

	if (isNaN(currentFactor) || isNaN(newFactor)) {
		return {
			direction: 'stable',
			magnitude: 'small',
			risk: getHealthFactorRisk(new_),
		};
	}

	const change = newFactor - currentFactor;
	const percentChange = Math.abs(change / currentFactor) * 100;

	return {
		direction: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable',
		magnitude: percentChange > 20 ? 'large' : percentChange > 5 ? 'moderate' : 'small',
		risk: getHealthFactorRisk(new_),
	};
}

/**
 * Get health factor risk level
 */
function getHealthFactorRisk(healthFactor: string): HealthFactorRiskLevel {
	if (healthFactor === '∞') return HEALTH_FACTOR_RISK_LEVELS.SAFE;

	const factor = parseFloat(healthFactor);
	if (isNaN(factor)) return HEALTH_FACTOR_RISK_LEVELS.SAFE;

	if (factor >= 2.0) return HEALTH_FACTOR_RISK_LEVELS.SAFE;
	if (factor >= HEALTH_FACTOR_CONSTANTS.SAFE_THRESHOLD) return HEALTH_FACTOR_RISK_LEVELS.MODERATE;
	if (factor >= HEALTH_FACTOR_CONSTANTS.CRITICAL_THRESHOLD) return HEALTH_FACTOR_RISK_LEVELS.HIGH;
	return HEALTH_FACTOR_RISK_LEVELS.CRITICAL;
}
