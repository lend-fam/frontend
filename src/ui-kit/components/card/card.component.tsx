import { type PropsWithChildren, type HTMLAttributes } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';
import css from './card.module.css';

interface CardProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
	/** Card width variant */
	width?: 'half' | 'full' | string;
	/** Optional theme override */
	theme?: Partial<typeof css>;
	/** Custom padding override */
	padding?: string;
}

export const Card = typedMemo((props: CardProps) => {
	const { children, width = 'full', theme: propsTheme, padding, className, style, ...restProps } = props;
	const theme = useTheme(css, propsTheme);

	const cardStyle = {
		...style,
		...(width === 'half' && { width: '49.5%', maxWidth: '49.5%' }),
		...(width === 'full' && { width: '100%' }),
		...(typeof width === 'string' && width !== 'half' && width !== 'full' && { width, maxWidth: width }),
		...(padding && { padding }),
	};

	return (
		<div {...restProps} className={`${theme.container} ${className || ''}`} style={cardStyle}>
			{children}
		</div>
	);
});
