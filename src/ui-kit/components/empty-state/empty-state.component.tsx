import { type HTMLAttributes } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';
import css from './empty-state.module.css';

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
	/** The message to display */
	message: string;
	/** Optional theme override */
	theme?: Partial<typeof css>;
}

export const EmptyState = typedMemo((props: EmptyStateProps) => {
	const { message, theme: propsTheme, className, ...restProps } = props;
	const theme = useTheme(css, propsTheme);

	return (
		<div 
			{...restProps}
			className={`${theme.container} ${className || ''}`}
		>
			{message}
		</div>
	);
});