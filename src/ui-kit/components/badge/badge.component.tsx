import { type HTMLAttributes, type ReactNode } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';
import css from './badge.module.css';

export type BadgeVariant =
	| 'success' // Green - for active/success states
	| 'warning' // Yellow - for warning states
	| 'error' // Red - for error states
	| 'info' // Blue - for informational states
	| 'neutral'; // Gray - for neutral/inactive states

export type BadgeSize =
	| 'small' // Compact badge
	| 'medium'; // Standard badge

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
	/** Badge content */
	children: ReactNode;
	/** Badge variant */
	variant?: BadgeVariant;
	/** Badge size */
	size?: BadgeSize;
	/** Optional theme override */
	theme?: Partial<typeof css>;
}

export const Badge = typedMemo((props: BadgeProps) => {
	const { children, variant = 'neutral', size = 'medium', theme: propsTheme, className, ...restProps } = props;

	const theme = useTheme(css, propsTheme);

	const badgeClasses = [theme.badge, theme[variant], theme[size], className].filter(Boolean).join(' ');

	return (
		<div {...restProps} className={badgeClasses}>
			{children}
		</div>
	);
});
