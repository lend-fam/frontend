import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import type {
	ActionButtonGroupProps,
	ButtonState,
	ActionButtonConfig,
	SupplyActionButtonProps,
	BorrowActionButtonProps,
} from './action-button-group.types';

export interface UseActionButtonsReturn {
	config: ActionButtonConfig;
	modals: {
		isPrimaryModalOpen: boolean;
		isSecondaryModalOpen: boolean;
		setPrimaryModalOpen: (open: boolean) => void;
		setSecondaryModalOpen: (open: boolean) => void;
	};
}

export const useActionButtons = (props: ActionButtonGroupProps): UseActionButtonsReturn => {
	const [isPrimaryModalOpen, setPrimaryModalOpen] = useState(false);
	const [isSecondaryModalOpen, setSecondaryModalOpen] = useState(false);
	const { isConnected } = useAccount();
	const chainId = useChainId();

	// ApeChain network IDs
	const APECHAIN_MAINNET = 33139;
	const APECHAIN_TESTNET = 33111;
	const isValidNetwork = chainId === APECHAIN_MAINNET || chainId === APECHAIN_TESTNET;

	const getWalletConnectionState = (additionalCheck?: () => boolean): ButtonState => {
		if (!isConnected) {
			return { disabled: true, text: 'Connect Wallet' };
		}
		if (!isValidNetwork) {
			return { disabled: true, text: 'Wrong Network' };
		}
		if (additionalCheck && !additionalCheck()) {
			return { disabled: true, text: 'No Balance' };
		}
		return { disabled: false, text: '' };
	};

	const handlePrimaryAction = () => {
		setPrimaryModalOpen(true);
		if (props.onAction) {
			props.onAction(props.marketAddress);
		}
	};

	const handleSecondaryAction = () => {
		setSecondaryModalOpen(true);
		if (props.onSecondaryAction) {
			props.onSecondaryAction(props.marketAddress);
		}
	};

	const handleTertiaryAction = () => {
		if (props.onTertiaryAction) {
			props.onTertiaryAction(props.marketAddress);
		}
	};

	const getSupplyConfig = (supplyProps: SupplyActionButtonProps): ActionButtonConfig => {
		const primaryButtonState = getWalletConnectionState(() =>
			supplyProps.walletBalance ? supplyProps.walletBalance > BigInt(0) : true,
		);

		if (supplyProps.hasSupplied) {
			return {
				primary: {
					className: 'supplyButton',
					handler: handlePrimaryAction,
					state: primaryButtonState.disabled ? primaryButtonState : { disabled: false, text: 'Supply' },
				},
				secondary: {
					className: 'withdrawButton',
					handler: handleSecondaryAction,
					text: 'Withdraw',
				},
			};
		}

		const config: ActionButtonConfig = {
			primary: {
				className: 'supplyButton',
				handler: handlePrimaryAction,
				state: primaryButtonState.disabled ? primaryButtonState : { disabled: false, text: 'Supply' },
			},
			secondary: {
				className: 'supplyButton',
				handler: handlePrimaryAction,
				text: 'Supply',
			},
		};

		if (supplyProps.showMoreMenu) {
			config.tertiary = {
				className: 'moreButton',
				handler: handleTertiaryAction,
				text: '...',
				ariaLabel: 'More actions',
			};
		}

		return config;
	};

	const getBorrowConfig = (borrowProps: BorrowActionButtonProps): ActionButtonConfig => {
		const isBorrowDisabled = borrowProps.availableLiquidity === BigInt(0);
		const primaryButtonState = getWalletConnectionState();

		if (borrowProps.hasBorrowed) {
			return {
				primary: {
					className: 'borrowButton',
					handler: handlePrimaryAction,
					state: isBorrowDisabled
						? { disabled: true, text: 'No Liquidity' }
						: { disabled: false, text: 'Borrow' },
				},
				secondary: {
					className: 'repayButton',
					handler: handleSecondaryAction,
					text: 'Repay',
				},
			};
		}

		return {
			primary: {
				className: 'borrowButton',
				handler: handlePrimaryAction,
				state: isBorrowDisabled
					? { disabled: true, text: 'No Liquidity' }
					: primaryButtonState.disabled
						? primaryButtonState
						: { disabled: false, text: 'Borrow' },
			},
			secondary: {
				className: 'detailsButton',
				handler: handleTertiaryAction,
				text: 'Details',
			},
		};
	};

	const config =
		props.variant === 'supply'
			? getSupplyConfig(props as SupplyActionButtonProps)
			: getBorrowConfig(props as BorrowActionButtonProps);

	return {
		config,
		modals: {
			isPrimaryModalOpen,
			isSecondaryModalOpen,
			setPrimaryModalOpen,
			setSecondaryModalOpen,
		},
	};
};
