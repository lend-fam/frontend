import { type FC, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';

import css from './button.module.css';

export type ButtonVariant =
	| 'primary' // Black background - for main actions (supply, borrow)
	| 'secondary' // Blue background - for secondary actions (withdraw, repay)
	| 'outline' // Border only - for utility actions (max, clean dust)
	| 'ghost' // Light background - for minimal actions (details, more)
	| 'gradient' // Gradient background - for special actions (faucet, external)
	| 'submit'; // Large submit button - for form submissions

export type ButtonSize =
	| 'small' // 12px font, 4px 8px padding - for utility buttons
	| 'medium' // 13px font, 8px 12px padding - for table actions
	| 'large'; // 16px font, 16px padding - for submit buttons

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	children: ReactNode;
	disabled?: boolean;
	loading?: boolean;
	fullWidth?: boolean;
	icon?: ReactNode;
	iconPosition?: 'left' | 'right';
	theme?: Record<string, string>;
	type?: 'button' | 'submit' | 'reset';
}

const ButtonComponent: FC<ButtonProps> = ({
	variant = 'primary',
	size = 'medium',
	children,
	disabled = false,
	loading = false,
	fullWidth = false,
	icon,
	iconPosition = 'left',
	className,
	theme,
	type = 'button',
	...props
}) => {
	const styles = useTheme(css, theme);

	const buttonClasses = [
		styles.button,
		styles[variant],
		styles[size],
		fullWidth && styles.fullWidth,
		loading && styles.loading,
		disabled && styles.disabled,
		className,
	]
		.filter(Boolean)
		.join(' ');

	const iconElement = icon && <span className={styles.icon}>{icon}</span>;

	const content = (
		<>
			{iconPosition === 'left' && iconElement}
			<span className={styles.content}>{loading ? 'Loading...' : children}</span>
			{iconPosition === 'right' && iconElement}
		</>
	);

	return (
		<button type={type} className={buttonClasses} disabled={disabled || loading} {...props}>
			{content}
		</button>
	);
};

export const Button = typedMemo(ButtonComponent);
