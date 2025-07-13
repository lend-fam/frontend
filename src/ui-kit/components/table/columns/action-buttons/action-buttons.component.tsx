import { type FC, useState, useRef } from 'react';
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
	const lastSupplyClickRef = useRef<number>(0);
	const lastWithdrawClickRef = useRef<number>(0);
	const lastSupplySuccessRef = useRef<number>(0);

	const handleSupply = () => {
		const now = Date.now();
		const timeSinceLastClick = now - lastSupplyClickRef.current;
		const timeSinceLastSuccess = now - lastSupplySuccessRef.current;

		if (timeSinceLastClick < 500 && timeSinceLastSuccess > 2000) {
			return;
		}

		lastSupplyClickRef.current = now;
		setIsSupplyModalOpen(true);
		if (onSupply) {
			onSupply(marketAddress);
		}
	};

	const handleWithdraw = () => {
		const now = Date.now();
		const timeSinceLastClick = now - lastWithdrawClickRef.current;

		if (timeSinceLastClick < 500) {
			return;
		}

		lastWithdrawClickRef.current = now;
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
				onSuccess={() => {
					lastSupplySuccessRef.current = Date.now();
				}}
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
