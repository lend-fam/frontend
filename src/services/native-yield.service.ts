import { formatUnits } from 'viem';

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
		if (apyRaw === 0n) return '0.00';
		const apy = Number(apyRaw) / 1000000000;
		return apy.toFixed(2);
	}

	/** Calculate accumulated yield based on balance and time */
	static calculateAccumulatedYield(balance: bigint, yieldRatePerBlock: bigint, blocksSinceUpdate: bigint): bigint {
		if (balance === 0n || yieldRatePerBlock === 0n || blocksSinceUpdate === 0n) {
			return 0n;
		}
		return (balance * yieldRatePerBlock * blocksSinceUpdate) / 10n ** 18n;
	}

	/** Format yield amount with appropriate precision */
	static formatYieldAmount(yieldAmount: bigint, symbol: string = 'APE'): string {
		const formatted = formatUnits(yieldAmount, 18);
		const number = parseFloat(formatted);

		if (number === 0 || number < 0.000001) return `0 ${symbol}`.trim();
		if (number < 0.01) return `<0.01 ${symbol}`.trim();
		if (number < 1) return `${number.toFixed(4)} ${symbol}`.trim();
		if (number < 1000) return `${number.toFixed(2)} ${symbol}`.trim();

		const formatter = new Intl.NumberFormat('en-US', {
			notation: 'compact',
			maximumFractionDigits: 2,
		});

		return `${formatter.format(number)} ${symbol}`.trim();
	}

	/** Calculate daily yield from APY */
	static calculateDailyYield(apy: string, balance: bigint): bigint {
		if (balance === 0n) return 0n;

		const apyNumber = parseFloat(apy);
		if (apyNumber === 0) return 0n;

		const dailyRate = apyNumber / 365 / 100;
		const balanceNumber = Number(formatUnits(balance, 18));
		const dailyYield = balanceNumber * dailyRate;

		return BigInt(Math.floor(dailyYield * 10 ** 18));
	}

	/** Compare native yield with lending APY */
	static compareYields(
		nativeAPY: string,
		lendingAPY: string,
	): {
		better: 'native' | 'lending' | 'equal';
		difference: string;
	} {
		const nativeRate = parseFloat(nativeAPY);
		const lendingRate = parseFloat(lendingAPY);

		if (nativeRate === lendingRate) {
			return { better: 'equal', difference: '0.00' };
		}

		if (nativeRate > lendingRate) {
			return {
				better: 'native',
				difference: (nativeRate - lendingRate).toFixed(2),
			};
		}

		return {
			better: 'lending',
			difference: (lendingRate - nativeRate).toFixed(2),
		};
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
