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
	/** Tooltip position */
	tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export const NativeYieldBadge = typedMemo((props: NativeYieldBadgeProps) => {
	const { apy, theme: propsTheme, className, tooltipPosition = 'top', ...restProps } = props;
	const theme = useTheme(css, propsTheme);

	return (
		<Tooltip
			content={
				<div className={theme.tooltipContent}>
					<div className={theme.emojiSection}>
						<strong>🦍</strong>
					</div>
					<div className={theme.description}>
						ApeChain&apos;s automatic yield feature that passively earns you extra APY on your APE holdings.
					</div>
					<a
						href="https://docs.apechain.com/apecoin-staking/native-yield/Overview"
						target="_blank"
						rel="noopener noreferrer"
						className={theme.learnMoreLink}>
						Learn more about Native Yield →
					</a>
				</div>
			}
			position={tooltipPosition}>
			<div {...restProps} className={`${theme.badge} ${className || ''}`}>
				{apy} 🦍
			</div>
		</Tooltip>
	);
});
