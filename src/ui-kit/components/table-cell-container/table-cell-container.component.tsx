import { type PropsWithChildren, type HTMLAttributes, type CSSProperties } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';
import css from './table-cell-container.module.css';

export type TableCellAlignment = 'left' | 'center' | 'right';
export type TableCellDirection = 'row' | 'column';

interface TableCellContainerProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
	/** Cell content alignment */
	align?: TableCellAlignment;
	/** Flex direction */
	direction?: TableCellDirection;
	/** Custom gap between items */
	gap?: string;
	/** Custom padding */
	padding?: string;
	/** Optional theme override */
	theme?: Partial<typeof css>;
}

export const TableCellContainer = typedMemo((props: TableCellContainerProps) => {
	const { 
		children, 
		align = 'right', 
		direction = 'row',
		gap,
		padding = '0 12px',
		theme: propsTheme,
		className,
		style,
		...restProps 
	} = props;
	
	const theme = useTheme(css, propsTheme);

	// Build class names based on props
	const containerClasses = [
		theme.container,
		theme[direction as keyof typeof theme],
		theme[align as keyof typeof theme],
		className
	].filter(Boolean).join(' ');

	// Custom style overrides
	const customStyle: CSSProperties = {
		...style,
		...(gap && { gap }),
		...(padding && { padding }),
	};

	return (
		<div 
			{...restProps}
			className={containerClasses}
			style={customStyle}
		>
			{children}
		</div>
	);
});