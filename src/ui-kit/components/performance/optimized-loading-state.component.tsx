import { type FC } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';

interface OptimizedLoadingStateProps {
	size?: 'small' | 'medium' | 'large';
	text?: string;
	variant?: 'spinner' | 'skeleton' | 'minimal';
}

// Lightweight loading component that doesn't cause re-renders
const OptimizedLoadingStateBase: FC<OptimizedLoadingStateProps> = ({
	size = 'medium',
	text = 'Loading...',
	variant = 'minimal',
}) => {
	const dimensions = {
		small: { width: '16px', height: '16px', fontSize: '11px' },
		medium: { width: '24px', height: '24px', fontSize: '12px' },
		large: { width: '32px', height: '32px', fontSize: '14px' },
	};

	const dim = dimensions[size];

	if (variant === 'minimal') {
		return (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '8px',
					color: '#9ca3af',
					fontSize: dim.fontSize,
				}}>
				<div
					style={{
						width: dim.width,
						height: dim.height,
						border: '2px solid #e5e7eb',
						borderTop: '2px solid #3b82f6',
						borderRadius: '50%',
						animation: 'spin 1s linear infinite',
					}}
				/>
				{text}
			</div>
		);
	}

	if (variant === 'skeleton') {
		return (
			<div
				style={{
					width: '100%',
					height: '20px',
					backgroundColor: '#f3f4f6',
					borderRadius: '4px',
					animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				}}
			/>
		);
	}

	// Default spinner variant
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '12px',
			}}>
			<div
				style={{
					width: dim.width,
					height: dim.height,
					border: '2px solid #e5e7eb',
					borderTop: '2px solid #3b82f6',
					borderRadius: '50%',
					animation: 'spin 1s linear infinite',
				}}
			/>
		</div>
	);
};

// Memoize to prevent unnecessary re-renders
export const OptimizedLoadingState = typedMemo(OptimizedLoadingStateBase);

// CSS-in-JS keyframes (added to head once)
const addKeyframes = (() => {
	let added = false;
	return () => {
		if (added) return;
		added = true;

		const style = document.createElement('style');
		style.textContent = `
			@keyframes spin {
				from { transform: rotate(0deg); }
				to { transform: rotate(360deg); }
			}
			@keyframes pulse {
				0%, 100% { opacity: 1; }
				50% { opacity: 0.5; }
			}
		`;
		document.head.appendChild(style);
	};
})();

// Auto-add keyframes on import
addKeyframes();
