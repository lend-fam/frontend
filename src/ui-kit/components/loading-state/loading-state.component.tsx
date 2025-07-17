import { type HTMLAttributes } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';
import css from './loading-state.module.css';

interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
	/** The title to display */
	title: string;
	/** Optional loading message */
	message?: string;
	/** Optional theme override */
	theme?: Partial<typeof css>;
}

export const LoadingState = typedMemo((props: LoadingStateProps) => {
	const {
		title,
		message = 'Fetching markets from blockchain...',
		theme: propsTheme,
		className,
		...restProps
	} = props;

	const theme = useTheme(css, propsTheme);

	return (
		<div {...restProps} className={`${theme.container} ${className || ''}`}>
			<p className={theme.title}>{title}</p>
			<div className={theme.message}>{message}</div>
		</div>
	);
});
