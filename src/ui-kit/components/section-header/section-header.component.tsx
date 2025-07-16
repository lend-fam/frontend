import { type ReactNode, type HTMLAttributes } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';
import css from './section-header.module.css';

export type SectionHeaderVariant = 'main' | 'subsection' | 'inline';

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
	/** The main title text */
	title: string;
	/** Optional subtitle or value to display alongside the title */
	subtitle?: string;
	/** Optional action element (buttons, controls, etc.) */
	action?: ReactNode;
	/** Header variant style */
	variant?: SectionHeaderVariant;
	/** Optional theme override */
	theme?: Partial<typeof css>;
}

export const SectionHeader = typedMemo((props: SectionHeaderProps) => {
	const { 
		title, 
		subtitle, 
		action, 
		variant = 'main', 
		theme: propsTheme, 
		className,
		...restProps 
	} = props;
	
	const theme = useTheme(css, propsTheme);

	// Get variant classes
	const containerClass = `${theme.container} ${theme[variant as keyof typeof theme]} ${className || ''}`;
	const titleClass = variant === 'subsection' ? theme.subsectionTitle : theme.title;

	return (
		<div {...restProps} className={containerClass}>
			<div className={theme.content}>
				<h3 className={titleClass}>{title}</h3>
				{subtitle && <p className={theme.subtitle}>{subtitle}</p>}
			</div>
			{action && <div className={theme.action}>{action}</div>}
		</div>
	);
});