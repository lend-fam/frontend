import { type FC, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
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
	walletBalance?: bigint;
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
	walletBalance = 0n,
	onSupply,
	onWithdraw,
	showMoreMenu = false,
	onMoreClick,
}) => {
	const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
	const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
	const { isConnected } = useAccount();
	const chainId = useChainId();

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

	// ApeChain network IDs
	const APECHAIN_MAINNET = 33139;
	const APECHAIN_TESTNET = 33111;
	const isValidNetwork = chainId === APECHAIN_MAINNET || chainId === APECHAIN_TESTNET;

	const getSupplyButtonState = () => {
		if (!isConnected) {
			return { disabled: true, text: 'Connect Wallet' };
		}
		if (!isValidNetwork) {
			return { disabled: true, text: 'Wrong Network' };
		}
		if (walletBalance === 0n) {
			return { disabled: true, text: 'No Balance' };
		}
		return { disabled: false, text: 'Supply' };
	};

	const supplyButtonState = getSupplyButtonState();

	return (
		<>
			<div className={css.container}>
				{hasSupplied ? (
					<>
						<button type="button" className={css.withdrawButton} onClick={handleWithdraw}>
							Withdraw
						</button>
						<button
							type="button"
							className={css.supplyButton}
							onClick={handleSupply}
							disabled={supplyButtonState.disabled}>
							{supplyButtonState.text}
						</button>
					</>
				) : (
					<>
						<button
							type="button"
							className={css.supplyButton}
							onClick={handleSupply}
							disabled={supplyButtonState.disabled}>
							{supplyButtonState.text}
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
