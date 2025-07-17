import { type HTMLAttributes, type ReactNode } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';
import css from './apy-display.module.css';

interface APYDisplayProps extends HTMLAttributes<HTMLDivElement> {
	/** The APY value to display */
	apy: string;
	/** Optional additional content (like native yield badge) */
	children?: ReactNode;
	/** Optional theme override */
	theme?: Partial<typeof css>;
}

export const APYDisplay = typedMemo((props: APYDisplayProps) => {
	const { apy, children, theme: propsTheme, className, ...restProps } = props;
	const theme = useTheme(css, propsTheme);

	return (
		<div {...restProps} className={`${theme.container} ${className || ''}`}>
			<div className={theme.apy}>{apy}</div>
			{children}
		</div>
	);
});
