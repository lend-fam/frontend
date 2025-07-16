import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';
import css from './icon-button.module.css';

export type IconButtonVariant = 'icon' | 'text';
export type IconButtonSize = 'small' | 'medium' | 'large';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/** Button variant */
	variant?: IconButtonVariant;
	/** Button size */
	size?: IconButtonSize;
	/** Button content (icon or text) */
	children: ReactNode;
	/** Optional theme override */
	theme?: Partial<typeof css>;
}

export const IconButton = typedMemo((props: IconButtonProps) => {
	const { 
		variant = 'icon',
		size = 'medium',
		children,
		theme: propsTheme,
		className,
		...restProps 
	} = props;
	
	const theme = useTheme(css, propsTheme);

	// Build class names based on props
	const buttonClasses = [
		theme.button,
		theme[variant as keyof typeof theme],
		theme[size as keyof typeof theme],
		className
	].filter(Boolean).join(' ');

	return (
		<button 
			{...restProps}
			className={buttonClasses}
		>
			{children}
		</button>
	);
});