import { type FC, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

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
	const chartData = useMemo(() => {
		if (!interestRateParams) {
			return [];
		}

		const { baseRateAPY, multiplierAPY, jumpMultiplierAPY, kinkUtilization, modelType } = interestRateParams;
		const points = [];

		for (let i = 0; i <= 100; i += 1) {
			const utilization = i / 100;
			let rate;

			if (modelType === 'WhitePaper') {
				rate = baseRateAPY + utilization * multiplierAPY;
			} else {
				const kink = (kinkUtilization || 80) / 100;

				if (utilization <= kink) {
					rate = baseRateAPY + utilization * multiplierAPY;
				} else {
					const rateAtKink = baseRateAPY + kink * multiplierAPY;
					const excessUtilization = utilization - kink;
					rate = rateAtKink + excessUtilization * (jumpMultiplierAPY || 0);
				}
			}

			points.push({
				utilization: i,
				rate: Number(rate.toFixed(3)),
				isCurrentPosition: Math.abs(i - currentUtilization) < 0.5,
			});
		}

		return points;
	}, [interestRateParams, currentUtilization]);

	if (!interestRateParams || chartData.length === 0) {
		return (
			<div
				style={{
					width: '100%',
					height: '240px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					border: '1px solid #E0E0E0',
					borderRadius: '8px',
				}}>
				<span style={{ color: '#666' }}>Loading contract data...</span>
			</div>
		);
	}

	const kinkUtilization = interestRateParams.kinkUtilization || 80;

	const CustomTooltip = ({
		active,
		payload,
		label,
	}: {
		active?: boolean;
		payload?: Array<{ value: number }>;
		label?: string;
	}) => {
		if (active && payload && payload.length) {
			return (
				<div
					style={{
						backgroundColor: 'rgba(255, 255, 255, 0.95)',
						padding: '12px',
						border: '1px solid #E0E0E0',
						borderRadius: '8px',
						boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
					}}>
					<p style={{ margin: 0, fontWeight: 'bold' }}>Utilization: {label}%</p>
					<p style={{ margin: '4px 0 0', color: '#4CAF50' }}>Borrow APY: {payload[0].value.toFixed(2)}%</p>
				</div>
			);
		}
		return null;
	};

	return (
		<div style={{ width: '100%', height: '240px' }}>
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={chartData} margin={{ top: 50, right: 30, left: 20, bottom: 20 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
					<XAxis
						dataKey="utilization"
						type="number"
						domain={[0, 100]}
						tickFormatter={(value) => `${value}%`}
						stroke="#999"
						fontSize={12}
					/>
					<YAxis tickFormatter={(value) => `${value}%`} stroke="#999" fontSize={12} />
					<Tooltip content={<CustomTooltip />} />

					<Line
						type="monotone"
						dataKey="rate"
						stroke="#4CAF50"
						strokeWidth={3}
						dot={false}
						activeDot={{ r: 6, fill: '#4CAF50' }}
					/>

					<ReferenceLine
						x={currentUtilization}
						stroke="#2196F3"
						strokeWidth={2}
						strokeDasharray="5 5"
						label={{
							value: `Current: ${currentRate.toFixed(2)}%`,
							position: 'top',
							offset: 13,
							style: {
								fontSize: '11px',
								fontWeight: 'bold',
								fill: '#2196F3',
							},
						}}
					/>

					{interestRateParams.modelType !== 'WhitePaper' && (
						<ReferenceLine
							x={kinkUtilization}
							stroke="#FF9800"
							strokeWidth={2}
							strokeDasharray="3 3"
							label={{
								value: `Kink: ${kinkUtilization.toFixed(0)}%`,
								position: 'top',
								offset: 13,
								style: {
									fontSize: '11px',
									fontWeight: 'bold',
									fill: '#FF9800',
								},
							}}
						/>
					)}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};
