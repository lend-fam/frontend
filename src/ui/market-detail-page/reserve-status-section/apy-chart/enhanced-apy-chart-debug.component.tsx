import { type FC } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAPYChartDataDebug, type TimeRange } from '../../../../hooks/use-apy-chart-data-debug.hook';
import { typedMemo } from '../../../../ui-kit/utils/typed-memo.utils';

interface EnhancedAPYChartDebugProps {
	cTokenMarket: string;
	timeRange: TimeRange;
	metric: 'supply' | 'borrow' | 'utilization';
	color: string;
	fallbackData?: Array<{ date: string; value: number }>;
}

export const EnhancedAPYChartDebug: FC<EnhancedAPYChartDebugProps> = typedMemo(
	({ cTokenMarket, timeRange, metric, color, fallbackData }) => {
		const {
			data: chartData,
			loading,
			error,
			isMockData,
		} = useAPYChartDataDebug({
			cTokenMarket,
			timeRange,
			metric,
		});

		const displayData =
			chartData.length > 0
				? chartData
				: fallbackData?.map((d, i) => ({
						timestamp: Date.now() / 1000 - (fallbackData.length - i) * 3600,
						supply: d.value,
						borrow: d.value,
						utilization: d.value,
						date: d.date,
					})) || [];

		if (loading) {
			return (
				<div
					style={{
						width: '100%',
						height: '145px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					<div style={{ color: '#9ca3af', fontSize: '12px' }}>Loading chart data...</div>
				</div>
			);
		}

		if (error) {
			return (
				<div
					style={{
						width: '100%',
						height: '145px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					<div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '8px' }}>
						GraphQL Error: {error.message}
					</div>
					<div style={{ color: '#6b7280', fontSize: '11px', textAlign: 'center' }}>
						Market: {cTokenMarket}
						<br />
						Using {isMockData ? 'mock' : 'real'} data ({displayData.length} points)
					</div>
				</div>
			);
		}

		if (displayData.length === 0) {
			return (
				<div
					style={{
						width: '100%',
						height: '145px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					<div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
						No chart data available
					</div>
					<div style={{ color: '#6b7280', fontSize: '11px' }}>Market: {cTokenMarket}</div>
				</div>
			);
		}

		const formatTooltipValue = (value: number) => {
			if (metric === 'utilization') {
				return `${(value * 100).toFixed(2)}%`;
			}
			return `${(value * 100).toFixed(2)}%`;
		};

		const formatYAxisValue = (value: number) => {
			if (metric === 'utilization') {
				return `${(value * 100).toFixed(0)}%`;
			}
			return `${(value * 100).toFixed(1)}%`;
		};

		return (
			<div style={{ width: '100%', height: '145px' }}>
				<div
					style={{
						fontSize: '10px',
						color: isMockData ? '#f59e0b' : '#10b981',
						marginBottom: '4px',
						textAlign: 'right',
					}}>
					{isMockData ? 'Using mock data' : 'Using subgraph data'} ({displayData.length} points)
				</div>

				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
						<XAxis
							dataKey="date"
							tick={{ fontSize: 11, fill: '#9ca3af' }}
							axisLine={false}
							tickLine={false}
						/>
						<YAxis
							tick={{ fontSize: 11, fill: '#9ca3af' }}
							axisLine={false}
							tickLine={false}
							tickFormatter={formatYAxisValue}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: '#ffffff',
								border: '1px solid #e5e7eb',
								borderRadius: '6px',
								fontSize: '12px',
								padding: '8px',
								boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
							}}
							formatter={(value: number) => [
								formatTooltipValue(value),
								metric === 'supply'
									? 'Supply APY'
									: metric === 'borrow'
										? 'Borrow APY'
										: 'Utilization Rate',
							]}
							labelStyle={{ color: '#374151' }}
						/>
						<Line
							type="monotone"
							dataKey={metric}
							stroke={color}
							strokeWidth={2.5}
							dot={{ r: 3, fill: color, stroke: '#ffffff', strokeWidth: 1 }}
							activeDot={{ r: 5, fill: color, stroke: '#ffffff', strokeWidth: 2 }}
							connectNulls={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		);
	},
);

EnhancedAPYChartDebug.displayName = 'EnhancedAPYChartDebug';
