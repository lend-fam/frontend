import { type FC } from 'react';
import type { Address } from 'viem';

import css from './borrow-action-buttons.module.css';

interface BorrowActionButtonsProps {
	marketAddress: Address;
	hasBorrowed: boolean;
	onBorrow?: (marketAddress: Address) => void;
	onRepay?: (marketAddress: Address) => void;
	onDetails?: (marketAddress: Address) => void;
}

export const BorrowActionButtons: FC<BorrowActionButtonsProps> = ({
	marketAddress,
	hasBorrowed,
	onBorrow,
	onRepay,
	onDetails,
}) => {
	const handleBorrow = () => {
		if (onBorrow) {
			onBorrow(marketAddress);
		}
	};

	const handleRepay = () => {
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
	);
};
