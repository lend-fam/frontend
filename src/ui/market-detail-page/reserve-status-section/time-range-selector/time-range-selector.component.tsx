import { type FC } from 'react';
import { type TimeRange } from '../../../../hooks/use-apy-chart-data.hook';
import { useDataRange } from '../../../../hooks/use-data-range.hook';
import { typedMemo } from '../../../../ui-kit/utils/typed-memo.utils';

interface TimeRangeSelectorProps {
	selectedRange: TimeRange;
	onRangeChange: (range: TimeRange) => void;
	cTokenMarket: string;
}

const timeRanges: { value: TimeRange; label: string }[] = [
	{ value: '24h', label: '24H' },
	{ value: '7d', label: '7D' },
	{ value: '30d', label: '30D' },
	{ value: '90d', label: '90D' },
	{ value: '1y', label: '1Y' },
];

export const TimeRangeSelector: FC<TimeRangeSelectorProps> = typedMemo(({ selectedRange, onRangeChange, cTokenMarket }) => {
	const { dataRangeInfo, loading } = useDataRange(cTokenMarket);

	return (
		<div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
			{timeRanges.map((range) => {
				const isAvailable = dataRangeInfo.isRangeAvailable(range.value);
				const isDisabled = !loading && !isAvailable;
				
				return (
					<button
						key={range.value}
						onClick={() => isAvailable && onRangeChange(range.value)}
						disabled={isDisabled}
						title={isDisabled ? `Not enough data for ${range.label}` : undefined}
						style={{
							padding: '4px 8px',
							fontSize: '12px',
							fontWeight: '500',
							border: '1px solid #e5e7eb',
							borderRadius: '4px',
							backgroundColor: selectedRange === range.value ? '#3b82f6' : isDisabled ? '#f9fafb' : '#ffffff',
							color: selectedRange === range.value ? '#ffffff' : isDisabled ? '#d1d5db' : '#6b7280',
							cursor: isDisabled ? 'not-allowed' : 'pointer',
							transition: 'all 0.2s',
							opacity: isDisabled ? 0.5 : 1,
						}}
						onMouseEnter={(e) => {
							if (selectedRange !== range.value && !isDisabled) {
								e.currentTarget.style.backgroundColor = '#f9fafb';
								e.currentTarget.style.borderColor = '#d1d5db';
							}
						}}
						onMouseLeave={(e) => {
							if (selectedRange !== range.value && !isDisabled) {
								e.currentTarget.style.backgroundColor = '#ffffff';
								e.currentTarget.style.borderColor = '#e5e7eb';
							}
						}}>
						{range.label}
					</button>
				);
			})}
			{!loading && dataRangeInfo.totalRangeDays > 0 && (
				<div style={{ 
					fontSize: '11px', 
					color: '#9ca3af', 
					marginLeft: '8px',
					whiteSpace: 'nowrap'
				}}>
					{dataRangeInfo.totalRangeDays.toFixed(0)} days of data
				</div>
			)}
		</div>
	);
});

TimeRangeSelector.displayName = 'TimeRangeSelector';
