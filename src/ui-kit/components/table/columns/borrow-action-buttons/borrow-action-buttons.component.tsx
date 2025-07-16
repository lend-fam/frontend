import { type FC, useState } from 'react';
import type { Address } from 'viem';

import { Button } from '../../../button/button.component';
import { FlexContainer } from '../../../flex-container/flex-container.component';
import { BorrowModal } from '../../../borrow-modal/borrow-modal.component';
import { RepayModal } from '../../../repay-modal/repay-modal.component';
import { useBorrowEligibility } from '../../../../../hooks/use-borrow-eligibility.hook';

import css from './borrow-action-buttons.module.css';

interface BorrowActionButtonsProps {
	marketAddress: Address;
	hasBorrowed: boolean;
	tokenSymbol: string;
	borrowAPY: string;
	availableLiquidity: bigint;
	tokenDecimals?: number;
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
	tokenDecimals = 18,
	onBorrow,
	onRepay,
	onDetails,
}) => {
	const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
	const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);

	const borrowEligibility = useBorrowEligibility({
		marketAddress,
		tokenDecimals,
		tokenSymbol,
	});

	const handleBorrow = () => {
		if (borrowEligibility.canBorrow) {
			setIsBorrowModalOpen(true);
			if (onBorrow) {
				onBorrow(marketAddress);
			}
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
			<FlexContainer variant="alignCenter" className={css.container}>
				{hasBorrowed ? (
					<>
						<Button
							variant="secondary"
							size="medium"
							onClick={handleBorrow}
							disabled={!borrowEligibility.canBorrow}
							title={
								borrowEligibility.canBorrow ? undefined : `Cannot borrow: ${borrowEligibility.reason}`
							}
						>
							{borrowEligibility.buttonText}
						</Button>
						<Button
							variant="outline"
							size="medium"
							onClick={handleRepay}
						>
							Repay
						</Button>
					</>
				) : (
					<>
						<Button
							variant="secondary"
							size="medium"
							onClick={handleBorrow}
							disabled={!borrowEligibility.canBorrow}
							title={
								borrowEligibility.canBorrow ? undefined : `Cannot borrow: ${borrowEligibility.reason}`
							}
						>
							{borrowEligibility.buttonText}
						</Button>
						<Button
							variant="ghost"
							size="medium"
							onClick={handleDetails}
						>
							Details
						</Button>
					</>
				)}
			</FlexContainer>

			<BorrowModal
				isOpen={isBorrowModalOpen}
				onClose={() => setIsBorrowModalOpen(false)}
				marketAddress={marketAddress}
				tokenSymbol={tokenSymbol}
				borrowAPY={borrowAPY}
				availableLiquidity={borrowEligibility.details.maxBorrowAmount || availableLiquidity}
			/>

			<RepayModal
				isOpen={isRepayModalOpen}
				onClose={() => setIsRepayModalOpen(false)}
				marketAddress={marketAddress}
				borrowAPY={borrowAPY}
			/>
		</>
	);
};
