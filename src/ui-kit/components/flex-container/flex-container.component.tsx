import { type PropsWithChildren, type HTMLAttributes, type CSSProperties } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';
import css from './flex-container.module.css';

export type FlexVariant =
	| 'center' // Center everything
	| 'spaceBetween' // Space between with center alignment
	| 'column' // Column layout
	| 'alignEnd' // Align to the end horizontally
	| 'alignCenter' // Center align items
	| 'columnCenter' // Column with center alignment
	| 'columnEnd'; // Column with end alignment

interface FlexContainerProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
	/** Predefined flex variant */
	variant?: FlexVariant;
	/** Custom flex direction */
	direction?: 'row' | 'column';
	/** Custom justify-content */
	justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
	/** Custom align-items */
	align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
	/** Custom gap between items */
	gap?: string | number;
	/** Custom flex wrap */
	wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
	/** Optional theme override */
	theme?: Partial<typeof css>;
}

export const FlexContainer = typedMemo((props: FlexContainerProps) => {
	const {
		children,
		variant,
		direction,
		justify,
		align,
		gap,
		wrap,
		theme: propsTheme,
		className,
		style,
		...restProps
	} = props;

	const theme = useTheme(css, propsTheme);

	// Get variant class name
	const variantClassName = variant ? theme[variant as keyof typeof theme] : '';

	// Custom style overrides
	const customStyle: CSSProperties = {
		...style,
		...(direction && { flexDirection: direction }),
		...(justify && { justifyContent: justify }),
		...(align && { alignItems: align }),
		...(gap && { gap: typeof gap === 'number' ? `${gap}px` : gap }),
		...(wrap && { flexWrap: wrap }),
	};

	return (
		<div {...restProps} className={`${theme.container} ${variantClassName} ${className || ''}`} style={customStyle}>
			{children}
		</div>
	);
});
