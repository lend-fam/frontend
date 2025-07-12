import { type FC, useState } from 'react';
import type { Address } from 'viem';

import { BorrowModal } from '../../../borrow-modal/borrow-modal.component';
import { RepayModal } from '../../../repay-modal/repay-modal.component';

import css from './borrow-action-buttons.module.css';

interface BorrowActionButtonsProps {
	marketAddress: Address;
	hasBorrowed: boolean;
	tokenSymbol: string;
	borrowAPY: string;
	availableLiquidity: bigint;
	onBorrow?: (marketAddress: Address) => void;
	onRepay?: (marketAddress: Address) => void;
	onDetails?: (marketAddress: Address) => void;
}

export const BorrowActionButtons: FC<BorrowActionButtonsProps> = ({
	marketAddress,
	hasBorrowed,
	tokenSymbol,
	borrowAPY,
	availableLiquidity,
	onBorrow,
	onRepay,
	onDetails,
}) => {
	const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
	const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);

	const handleBorrow = () => {
		setIsBorrowModalOpen(true);
		if (onBorrow) {
			onBorrow(marketAddress);
		}
	};

	const handleRepay = () => {
		setIsRepayModalOpen(true);
		if (onRepay) {
			onRepay(marketAddress);
		}
	};

	const handleDetails = () => {
		if (onDetails) {
			onDetails(marketAddress);
		}
	};

	return (
		<>
			<div className={css.container}>
				{hasBorrowed ? (
					<>
						<button type="button" className={css.repayButton} onClick={handleRepay}>
							Repay
						</button>
						<button type="button" className={css.borrowButton} onClick={handleBorrow}>
							Borrow
						</button>
					</>
				) : (
					<>
						<button type="button" className={css.borrowButton} onClick={handleBorrow}>
							Borrow
						</button>
						<button type="button" className={css.detailsButton} onClick={handleDetails}>
							Details
						</button>
					</>
				)}
			</div>

			<BorrowModal
				isOpen={isBorrowModalOpen}
				onClose={() => setIsBorrowModalOpen(false)}
				marketAddress={marketAddress}
				tokenSymbol={tokenSymbol}
				borrowAPY={borrowAPY}
				availableLiquidity={availableLiquidity}
			/>

			<RepayModal
				isOpen={isRepayModalOpen}
				onClose={() => setIsRepayModalOpen(false)}
				marketAddress={marketAddress}
				tokenSymbol={tokenSymbol}
				borrowAPY={borrowAPY}
			/>
		</>
	);
};
