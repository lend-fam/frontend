import { type FC, useState } from 'react';
import type { Address } from 'viem';

import { SupplyModal } from '../../../supply-modal/supply-modal.component';
import { WithdrawModal } from '../../../withdraw-modal/withdraw-modal.component';

import css from './action-buttons.module.css';

interface ActionButtonsProps {
	marketAddress: Address;
	hasSupplied: boolean;
	tokenSymbol: string;
	supplyAPY: string;
	isCollateralEnabled?: boolean;
	onSupply?: (marketAddress: Address) => void;
	onWithdraw?: (marketAddress: Address) => void;
	showMoreMenu?: boolean;
	onMoreClick?: (marketAddress: Address) => void;
}

export const ActionButtons: FC<ActionButtonsProps> = ({
	marketAddress,
	hasSupplied,
	tokenSymbol,
	supplyAPY,
	isCollateralEnabled = false,
	onSupply,
	onWithdraw,
	showMoreMenu = false,
	onMoreClick,
}) => {
	const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
	const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

	const handleSupply = () => {
		setIsSupplyModalOpen(true);
		if (onSupply) {
			onSupply(marketAddress);
		}
	};

	const handleWithdraw = () => {
		setIsWithdrawModalOpen(true);
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
		<>
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
							<button
								type="button"
								className={css.moreButton}
								onClick={handleMore}
								aria-label="More actions">
								<span className={css.dots}>...</span>
							</button>
						)}
					</>
				)}
			</div>

			<SupplyModal
				isOpen={isSupplyModalOpen}
				onClose={() => setIsSupplyModalOpen(false)}
				marketAddress={marketAddress}
				tokenSymbol={tokenSymbol}
				supplyAPY={supplyAPY}
				isCollateralEnabled={isCollateralEnabled}
			/>

			<WithdrawModal
				isOpen={isWithdrawModalOpen}
				onClose={() => setIsWithdrawModalOpen(false)}
				marketAddress={marketAddress}
				tokenSymbol={tokenSymbol}
				supplyAPY={supplyAPY}
			/>
		</>
	);
};
