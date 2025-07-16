import { type HTMLAttributes } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';
import { Tooltip } from '../tooltip';
import css from './native-yield-badge.module.css';

interface NativeYieldBadgeProps extends HTMLAttributes<HTMLDivElement> {
	/** The native yield APY percentage to display */
	apy: string;
	/** Optional theme override */
	theme?: Partial<typeof css>;
}

export const NativeYieldBadge = typedMemo((props: NativeYieldBadgeProps) => {
	const { apy, theme: propsTheme, className, ...restProps } = props;
	const theme = useTheme(css, propsTheme);

	return (
		<Tooltip
			content={
				<div className={theme.tooltipContent}>
					<div className={theme.emojiSection}>
						<strong>🦍</strong>
					</div>
					<div className={theme.description}>
						ApeChain&apos;s built-in yield feature that automatically earns you additional APY
						on your APE token holdings.
					</div>
					<a
						href="https://docs.apechain.com/apecoin-staking/native-yield/Overview"
						target="_blank"
						rel="noopener noreferrer"
						className={theme.learnMoreLink}
					>
						Learn more about Native Yield →
					</a>
				</div>
			}
			position="top"
		>
			<div 
				{...restProps}
				className={`${theme.badge} ${className || ''}`}
			>
				{apy} 🦍
			</div>
		</Tooltip>
	);
});