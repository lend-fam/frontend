import { type FC } from 'react';

interface APYChartProps {
	data: Array<{ date: string; value: number }>;
	color: string;
}

export const APYChart: FC<APYChartProps> = ({ data, color }) => {
	const width = 400;
	const height = 120;
	const padding = 30;

	// Validate data and filter out invalid values
	const validData = data.filter(
		(d) => d && typeof d.value === 'number' && !isNaN(d.value) && isFinite(d.value) && d.date,
	);

	// If no valid data, render empty chart
	if (validData.length === 0) {
		return (
			<div style={{ width: '100%', height: `${height + 25}px`, marginBottom: '8px' }}>
				<svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
					<text x={width / 2} y={height / 2} textAnchor="middle" fill="#9ca3af" fontSize="12">
						No chart data available
					</text>
				</svg>
			</div>
		);
	}

	// Calculate scales with validation
	const values = validData.map((d) => d.value);
	const maxValue = Math.max(...values);
	const minValue = Math.min(...values);
	const valueRange = maxValue - minValue;

	// Handle edge case where all values are the same
	const safeValueRange = valueRange === 0 ? 1 : valueRange;

	// Create path for the line using valid data
	const points = validData
		.map((point, index) => {
			const x = padding + (index / (validData.length - 1)) * (width - 2 * padding);
			const y = height - padding - ((point.value - minValue) / safeValueRange) * (height - 2 * padding);

			// Ensure coordinates are valid numbers
			const safeX = isFinite(x) ? x : padding;
			const safeY = isFinite(y) ? y : height - padding;

			return `${safeX},${safeY}`;
		})
		.join(' ');

	const pathData = `M ${points.split(' ').join(' L ')}`;

	// Create area path for filled area under the curve
	const areaPath = `M ${padding},${height - padding} L ${pathData.slice(2)} L ${width - padding},${height - padding} Z`;

	return (
		<div style={{ width: '100%', height: `${height + 25}px`, marginBottom: '8px' }}>
			<svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
				{/* Grid lines */}
				{[0.25, 0.5, 0.75].map((ratio, index) => (
					<line
						key={index}
						x1={padding}
						y1={padding + ratio * (height - 2 * padding)}
						x2={width - padding}
						y2={padding + ratio * (height - 2 * padding)}
						stroke="#f3f4f6"
						strokeWidth={1}
						opacity={0.5}
					/>
				))}

				{/* Area under curve */}
				<path d={areaPath} fill={color} fillOpacity={0.1} />

				{/* APY line */}
				<path
					d={pathData}
					fill="none"
					stroke={color}
					strokeWidth={2.5}
					strokeLinecap="round"
					strokeLinejoin="round"
				/>

				{/* Data points */}
				{validData.map((point, index) => {
					const x = padding + (index / (validData.length - 1)) * (width - 2 * padding);
					const y = height - padding - ((point.value - minValue) / safeValueRange) * (height - 2 * padding);

					// Ensure coordinates are valid numbers
					const safeX = isFinite(x) ? x : padding;
					const safeY = isFinite(y) ? y : height - padding;

					return (
						<circle key={index} cx={safeX} cy={safeY} r={2.5} fill={color} stroke="white" strokeWidth={1} />
					);
				})}
			</svg>

			{/* X-axis labels */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					marginTop: '8px',
					paddingLeft: `${padding}px`,
					paddingRight: `${padding}px`,
					fontSize: '11px',
					color: '#9ca3af',
					height: '15px',
				}}>
				{validData.map((point, index) => (
					<span key={index} style={{ textAlign: 'center', minWidth: '30px' }}>
						{point.date}
					</span>
				))}
			</div>
		</div>
	);
};
