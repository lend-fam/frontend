import { MathService } from './math.service';
import { FormattingService } from './formatting.service';

export type YieldMode = 'automatic' | 'claimable' | 'void';

export interface NativeYieldData {
	currentAPY: string;
	yieldMode: YieldMode;
	accumulatedYield: bigint;
	lastUpdateBlock: bigint;
}

export class NativeYieldService {
	/** Calculate APY from raw contract value (9 decimal places) */
	static calculateNativeYieldAPY(apyRaw: bigint): string {
		return MathService.calculateNativeYieldAPY(apyRaw);
	}

	/** Calculate accumulated yield based on balance and time */
	static calculateAccumulatedYield(balance: bigint, yieldRatePerBlock: bigint, blocksSinceUpdate: bigint): bigint {
		return MathService.calculateAccumulatedYield(balance, yieldRatePerBlock, blocksSinceUpdate);
	}

	/** Format yield amount with appropriate precision */
	static formatYieldAmount(yieldAmount: bigint, symbol: string = 'APE'): string {
		return FormattingService.formatTokenBalance(yieldAmount, 18, symbol);
	}

	/** Calculate daily yield from APY */
	static calculateDailyYield(apy: string, balance: bigint): bigint {
		return MathService.calculateDailyYield(apy, balance);
	}

	/** Compare native yield with lending APY */
	static compareYields(
		nativeAPY: string,
		lendingAPY: string,
	): {
		better: 'native' | 'lending' | 'equal';
		difference: string;
	} {
		return MathService.compareYields(nativeAPY, lendingAPY, 'native', 'lending');
	}

	/** Check if native yield is enabled for address */
	static isNativeYieldEnabled(yieldMode: YieldMode): boolean {
		return yieldMode === 'automatic' || yieldMode === 'claimable';
	}

	/** Get yield mode display name */
	static getYieldModeDisplay(yieldMode: YieldMode): string {
		switch (yieldMode) {
			case 'automatic':
				return 'Automatic';
			case 'claimable':
				return 'Claimable';
			case 'void':
				return 'Disabled';
			default:
				return 'Unknown';
		}
	}
}
