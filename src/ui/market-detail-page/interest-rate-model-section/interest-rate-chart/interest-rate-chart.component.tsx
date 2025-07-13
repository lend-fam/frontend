import { type FC } from 'react';

interface InterestRateChartProps {
	currentRate: number;
	currentUtilization: number;
	interestRateParams?: {
		baseRateAPY: number;
		multiplierAPY: number;
		jumpMultiplierAPY?: number;
		kinkUtilization?: number;
		modelType: string;
	};
}

export const InterestRateChart: FC<InterestRateChartProps> = ({
	currentRate,
	currentUtilization,
	interestRateParams,
}) => {
	const width = 800;
	const height = 240;
	const padding = 50;

	// Generate curve data points using real interest rate model
	const generateCurveData = () => {
		const points = [];

		if (!interestRateParams) {
			return [];
		}

		const { baseRateAPY, multiplierAPY, jumpMultiplierAPY, kinkUtilization, modelType } = interestRateParams;

		// Calculate max rate to set proper scale
		let maxRate;
		if (modelType === 'WhitePaper') {
			// For WhitePaper: max rate at 100% utilization
			maxRate = baseRateAPY + multiplierAPY;
		} else {
			// For JumpRate: calculate rate at 100% utilization
			const kink = (kinkUtilization || 80) / 100;
			const rateAtKink = baseRateAPY + kink * multiplierAPY;
			maxRate = rateAtKink + (1 - kink) * (jumpMultiplierAPY || 0);
		}

		// Set scale with some padding - use at least 10% to show the curve properly
		const displayMaxAPY = Math.max(maxRate * 1.2, 10);

		for (let i = 0; i <= 100; i += 2) {
			const utilization = i / 100; // Convert to decimal
			let rate;

			if (modelType === 'WhitePaper') {
				// Linear model: rate = baseRate + (utilization * multiplier)
				rate = baseRateAPY + utilization * multiplierAPY;
			} else {
				// Jump rate model
				const kink = (kinkUtilization || 80) / 100;

				if (utilization <= kink) {
					// Before kink: linear slope
					rate = baseRateAPY + utilization * multiplierAPY;
				} else {
					// After kink: steeper slope
					const rateAtKink = baseRateAPY + kink * multiplierAPY;
					const excessUtilization = utilization - kink;
					rate = rateAtKink + excessUtilization * (jumpMultiplierAPY || 0);
				}
			}

			const x = padding + (i / 100) * (width - 2 * padding);
			const y = height - padding - (rate / displayMaxAPY) * (height - 2 * padding);

			points.push({ x, y, utilization: i, rate, maxAPY: displayMaxAPY });
		}
		return points;
	};

	const curveData = generateCurveData();

	// Show loading state if no contract data yet
	if (!interestRateParams || curveData.length === 0) {
		return (
			<div
				style={{
					width: '100%',
					height: '240px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: '#FAFAFA',
					border: '1px solid #E0E0E0',
					borderRadius: '8px',
				}}>
				<span style={{ color: '#666' }}>Loading contract data...</span>
			</div>
		);
	}

	const pathData = `M ${curveData.map((p) => `${p.x},${p.y}`).join(' L ')}`;

	// Get dynamic scale from curve data
	const dynamicMaxAPY = curveData.length > 0 ? curveData[0].maxAPY : 10;

	// Current position - properly scaled with real contract data
	const currentX = padding + (currentUtilization / 100) * (width - 2 * padding);

	// Use real kink utilization from contract
	const optimalUtilization = interestRateParams.kinkUtilization || 45;
	const optimalX = padding + (optimalUtilization / 100) * (width - 2 * padding);

	return (
		<svg
			width="100%"
			height="100%"
			viewBox={`0 0 ${width} ${height}`}
			preserveAspectRatio="xMidYMid meet"
			style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', backgroundColor: '#FAFAFA' }}>
			{/* Light background */}
			<rect width="100%" height="100%" fill="#FAFAFA" />

			{/* Subtle grid lines - horizontal */}
			{[dynamicMaxAPY * 0.25, dynamicMaxAPY * 0.5, dynamicMaxAPY * 0.75].map((rate) => (
				<line
					key={`h-${rate}`}
					x1={padding}
					y1={height - padding - (rate / dynamicMaxAPY) * (height - 2 * padding)}
					x2={width - padding}
					y2={height - padding - (rate / dynamicMaxAPY) * (height - 2 * padding)}
					stroke="rgba(0, 0, 0, 0.1)"
					strokeWidth={1}
				/>
			))}

			{/* Interest rate curve - green to match image */}
			<path
				d={pathData}
				fill="none"
				stroke="#4CAF50"
				strokeWidth={3}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Current position vertical line */}
			<line
				x1={currentX}
				y1={padding}
				x2={currentX}
				y2={height - padding}
				stroke="#2196F3"
				strokeWidth={2}
				strokeDasharray="5,5"
			/>

			{/* Optimal position vertical line */}
			<line
				x1={optimalX}
				y1={padding}
				x2={optimalX}
				y2={height - padding}
				stroke="#2196F3"
				strokeWidth={2}
				strokeDasharray="5,5"
			/>

			{/* Current position label */}
			<text x={currentX} y={padding - 30} fontSize="12" fill="#333" textAnchor="middle" fontWeight="600">
				Current
			</text>
			<text x={currentX} y={padding - 15} fontSize="12" fill="#333" textAnchor="middle" fontWeight="600">
				{currentRate.toFixed(2)}%
			</text>

			{/* Optimal position label */}
			<text x={optimalX} y={padding - 25} fontSize="12" fill="#333" textAnchor="middle" fontWeight="600">
				Optimal
			</text>
			<text x={optimalX} y={padding - 10} fontSize="12" fill="#333" textAnchor="middle" fontWeight="600">
				{optimalUtilization.toFixed(0)}%
			</text>

			{/* X-axis labels */}
			<text x={padding} y={height - 15} fontSize="12" fill="#999" textAnchor="middle">
				0%
			</text>
			<text
				x={padding + (25 / 100) * (width - 2 * padding)}
				y={height - 15}
				fontSize="12"
				fill="#999"
				textAnchor="middle">
				25%
			</text>
			<text x={width / 2} y={height - 15} fontSize="12" fill="#999" textAnchor="middle">
				50%
			</text>
			<text
				x={padding + (75 / 100) * (width - 2 * padding)}
				y={height - 15}
				fontSize="12"
				fill="#999"
				textAnchor="middle">
				75%
			</text>
			<text x={width - padding} y={height - 15} fontSize="12" fill="#999" textAnchor="middle">
				100%
			</text>

			{/* Y-axis labels */}
			<text x={15} y={height - padding + 4} fontSize="12" fill="#999" textAnchor="start">
				0%
			</text>
			<text
				x={15}
				y={height - padding - 0.25 * (height - 2 * padding) + 4}
				fontSize="12"
				fill="#999"
				textAnchor="start">
				{(dynamicMaxAPY * 0.25).toFixed(1)}%
			</text>
			<text
				x={15}
				y={height - padding - 0.5 * (height - 2 * padding) + 4}
				fontSize="12"
				fill="#999"
				textAnchor="start">
				{(dynamicMaxAPY * 0.5).toFixed(1)}%
			</text>
			<text
				x={15}
				y={height - padding - 0.75 * (height - 2 * padding) + 4}
				fontSize="12"
				fill="#999"
				textAnchor="start">
				{(dynamicMaxAPY * 0.75).toFixed(1)}%
			</text>
			<text x={15} y={padding + 4} fontSize="12" fill="#999" textAnchor="start">
				{dynamicMaxAPY.toFixed(1)}%
			</text>
		</svg>
	);
};
