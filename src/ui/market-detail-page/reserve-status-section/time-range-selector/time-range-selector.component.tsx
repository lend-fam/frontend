import { type FC } from 'react';
import { type TimeRange } from '../../../../hooks/use-apy-chart-data.hook';
import { typedMemo } from '../../../../ui-kit/utils/typed-memo.utils';

interface TimeRangeSelectorProps {
	selectedRange: TimeRange;
	onRangeChange: (range: TimeRange) => void;
}

const timeRanges: { value: TimeRange; label: string }[] = [
	{ value: '24h', label: '24H' },
	{ value: '7d', label: '7D' },
	{ value: '30d', label: '30D' },
	{ value: '90d', label: '90D' },
	{ value: '1y', label: '1Y' },
];

export const TimeRangeSelector: FC<TimeRangeSelectorProps> = typedMemo(({ selectedRange, onRangeChange }) => {
	return (
		<div style={{ display: 'flex', gap: '4px' }}>
			{timeRanges.map((range) => (
				<button
					key={range.value}
					onClick={() => onRangeChange(range.value)}
					style={{
						padding: '4px 8px',
						fontSize: '12px',
						fontWeight: '500',
						border: '1px solid #e5e7eb',
						borderRadius: '4px',
						backgroundColor: selectedRange === range.value ? '#3b82f6' : '#ffffff',
						color: selectedRange === range.value ? '#ffffff' : '#6b7280',
						cursor: 'pointer',
						transition: 'all 0.2s',
					}}
					onMouseEnter={(e) => {
						if (selectedRange !== range.value) {
							e.currentTarget.style.backgroundColor = '#f9fafb';
							e.currentTarget.style.borderColor = '#d1d5db';
						}
					}}
					onMouseLeave={(e) => {
						if (selectedRange !== range.value) {
							e.currentTarget.style.backgroundColor = '#ffffff';
							e.currentTarget.style.borderColor = '#e5e7eb';
						}
					}}>
					{range.label}
				</button>
			))}
		</div>
	);
});

TimeRangeSelector.displayName = 'TimeRangeSelector';
