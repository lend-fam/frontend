import { type FC } from 'react';

import { SupplyModal } from '../supply-modal/supply-modal.component';
import { WithdrawModal } from '../withdraw-modal/withdraw-modal.component';
import { BorrowModal } from '../borrow-modal/borrow-modal.component';
import { RepayModal } from '../repay-modal/repay-modal.component';

import { useActionButtons } from './use-action-buttons.hook';
import type { 
	ActionButtonGroupProps, 
	SupplyActionButtonProps, 
	BorrowActionButtonProps 
} from './action-button-group.types';

import css from './action-button-group.module.css';

export const ActionButtonGroup: FC<ActionButtonGroupProps> = (props) => {
	const { config, modals } = useActionButtons(props);

	const renderButtons = () => {
		const isSupplyVariant = props.variant === 'supply';
		const supplyProps = props as SupplyActionButtonProps;
		const borrowProps = props as BorrowActionButtonProps;

		if (isSupplyVariant && supplyProps.hasSupplied) {
			// Has supplied: Show Withdraw + Supply
			return (
				<>
					<button 
						type="button" 
						className={css[config.secondary.className]}
						onClick={config.secondary.handler}
					>
						{config.secondary.text}
					</button>
					<button
						type="button"
						className={css[config.primary.className]}
						onClick={config.primary.handler}
						disabled={config.primary.state?.disabled}
					>
						{config.primary.state?.text || 'Supply'}
					</button>
				</>
			);
		}

		if (!isSupplyVariant && borrowProps.hasBorrowed) {
			// Has borrowed: Show Repay + Borrow
			return (
				<>
					<button 
						type="button" 
						className={css[config.secondary.className]}
						onClick={config.secondary.handler}
					>
						{config.secondary.text}
					</button>
					<button
						type="button"
						className={css[config.primary.className]}
						onClick={config.primary.handler}
						disabled={config.primary.state?.disabled}
					>
						{config.primary.state?.text || 'Borrow'}
					</button>
				</>
			);
		}

		if (isSupplyVariant) {
			// No supply: Show Supply + More (optional)
			return (
				<>
					<button
						type="button"
						className={css[config.primary.className]}
						onClick={config.primary.handler}
						disabled={config.primary.state?.disabled}
					>
						{config.primary.state?.text || 'Supply'}
					</button>
					{config.tertiary && (
						<button
							type="button"
							className={css[config.tertiary.className]}
							onClick={config.tertiary.handler}
							aria-label={config.tertiary.ariaLabel}
						>
							<span className={css.dots}>{config.tertiary.text}</span>
						</button>
					)}
				</>
			);
		}

		// No borrow: Show Borrow + Details
		return (
			<>
				<button
					type="button"
					className={css[config.primary.className]}
					onClick={config.primary.handler}
					disabled={config.primary.state?.disabled}
				>
					{config.primary.state?.text || 'Borrow'}
				</button>
				<button 
					type="button" 
					className={css[config.secondary.className]}
					onClick={config.secondary.handler}
				>
					{config.secondary.text}
				</button>
			</>
		);
	};

	const renderModals = () => {
		if (props.variant === 'supply') {
			const supplyProps = props as SupplyActionButtonProps;
			return (
				<>
					<SupplyModal
						isOpen={modals.isPrimaryModalOpen}
						onClose={() => modals.setPrimaryModalOpen(false)}
						marketAddress={supplyProps.marketAddress}
						supplyAPY={supplyProps.supplyAPY}
						isCollateralEnabled={supplyProps.isCollateralEnabled || false}
					/>
					<WithdrawModal
						isOpen={modals.isSecondaryModalOpen}
						onClose={() => modals.setSecondaryModalOpen(false)}
						marketAddress={supplyProps.marketAddress}
						tokenSymbol={supplyProps.tokenSymbol}
						supplyAPY={supplyProps.supplyAPY}
					/>
				</>
			);
		}

		const borrowProps = props as BorrowActionButtonProps;
		return (
			<>
				<BorrowModal
					isOpen={modals.isPrimaryModalOpen}
					onClose={() => modals.setPrimaryModalOpen(false)}
					marketAddress={borrowProps.marketAddress}
					tokenSymbol={borrowProps.tokenSymbol}
					borrowAPY={borrowProps.borrowAPY}
					availableLiquidity={borrowProps.availableLiquidity}
				/>
				<RepayModal
					isOpen={modals.isSecondaryModalOpen}
					onClose={() => modals.setSecondaryModalOpen(false)}
					marketAddress={borrowProps.marketAddress}
					borrowAPY={borrowProps.borrowAPY}
				/>
			</>
		);
	};

	return (
		<>
			<div className={css.container}>
				{renderButtons()}
			</div>
			{renderModals()}
		</>
	);
};