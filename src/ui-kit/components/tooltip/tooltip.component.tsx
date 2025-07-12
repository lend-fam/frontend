import { type FC, type ReactNode, useState } from 'react';
import css from './tooltip.module.css';

interface TooltipProps {
	content: ReactNode;
	children: ReactNode;
	position?: 'top' | 'bottom' | 'left' | 'right';
	className?: string;
}

export const Tooltip: FC<TooltipProps> = ({ content, children, position = 'top', className = '' }) => {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<div
			className={`${css.tooltipContainer} ${className}`}
			onMouseEnter={() => setIsVisible(true)}
			onMouseLeave={() => setIsVisible(false)}>
			{children}
			{isVisible && (
				<div className={`${css.tooltip} ${css[position]}`}>
					<div className={css.tooltipContent}>{content}</div>
					<div className={css.tooltipArrow} />
				</div>
			)}
		</div>
	);
};
