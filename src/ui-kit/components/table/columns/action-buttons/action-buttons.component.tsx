import { type FC } from 'react';
import type { Address } from 'viem';

import css from './action-buttons.module.css';

interface ActionButtonsProps {
	marketAddress: Address;
	hasSupplied: boolean;
	onSupply?: (marketAddress: Address) => void;
	onWithdraw?: (marketAddress: Address) => void;
	showMoreMenu?: boolean;
	onMoreClick?: (marketAddress: Address) => void;
}

export const ActionButtons: FC<ActionButtonsProps> = ({
	marketAddress,
	hasSupplied,
	onSupply,
	onWithdraw,
	showMoreMenu = false,
	onMoreClick,
}) => {
	const handleSupply = () => {
		if (onSupply) {
			onSupply(marketAddress);
		}
	};

	const handleWithdraw = () => {
		if (onWithdraw) {
			onWithdraw(marketAddress);
		}
	};

	const handleMore = () => {
		if (onMoreClick) {
			onMoreClick(marketAddress);
		}
	};

	return (
		<div className={css.container}>
			{hasSupplied ? (
				<>
					<button type="button" className={css.withdrawButton} onClick={handleWithdraw}>
						Withdraw
					</button>
					<button type="button" className={css.supplyButton} onClick={handleSupply}>
						Supply
					</button>
				</>
			) : (
				<>
					<button type="button" className={css.supplyButton} onClick={handleSupply}>
						Supply
					</button>
					{showMoreMenu && (
						<button type="button" className={css.moreButton} onClick={handleMore} aria-label="More actions">
							<span className={css.dots}>...</span>
						</button>
					)}
				</>
			)}
		</div>
	);
};
