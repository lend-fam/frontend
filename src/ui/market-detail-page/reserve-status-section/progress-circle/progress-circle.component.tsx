import { type FC } from 'react';

interface ProgressCircleProps {
	value: number; // 0-100
	size: number;
	strokeWidth: number;
	color: string;
	showInfinity?: boolean; // Show infinity symbol instead of percentage
}

export const ProgressCircle: FC<ProgressCircleProps> = ({ value, size, strokeWidth, color, showInfinity = false }) => {
	// Validate and sanitize the value
	const safeValue = isNaN(value) || !isFinite(value) ? 0 : Math.max(0, Math.min(100, value));

	const center = size / 2;
	const radius = center - strokeWidth / 2;
	const circumference = 2 * Math.PI * radius;
	const strokeDasharray = circumference;
	const strokeDashoffset = circumference - (safeValue / 100) * circumference;

	return (
		<div style={{ position: 'relative', display: 'inline-block' }}>
			<svg width={size} height={size} className="progress-circle">
				{/* Background circle */}
				<circle cx={center} cy={center} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
				{/* Progress circle */}
				<circle
					cx={center}
					cy={center}
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth={strokeWidth}
					strokeDasharray={strokeDasharray}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
					transform={`rotate(-90 ${center} ${center})`}
					style={{
						transition: 'stroke-dashoffset 0.5s ease-in-out',
						filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
					}}
				/>
				{/* Percentage text or infinity symbol */}
				<text
					x={center}
					y={center + (showInfinity ? 2 : 0)}
					textAnchor="middle"
					dominantBaseline="middle"
					fill={color}
					style={{
						fontSize: showInfinity ? `${size * 0.4}px` : `${size * 0.2}px`,
						fontWeight: 'bold',
						fontFamily: 'Inter, sans-serif',
					}}>
					{showInfinity ? '∞' : `${safeValue.toFixed(1)}%`}
				</text>
			</svg>
		</div>
	);
};
