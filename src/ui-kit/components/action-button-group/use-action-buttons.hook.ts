import { useState, useRef } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useBorrowEligibility } from '../../../hooks/use-borrow-eligibility.hook';
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
	callbacks: {
		onPrimarySuccess: () => void;
		onSecondarySuccess: () => void;
	};
}

export const useActionButtons = (props: ActionButtonGroupProps): UseActionButtonsReturn => {
	const [isPrimaryModalOpen, setPrimaryModalOpen] = useState(false);
	const [isSecondaryModalOpen, setSecondaryModalOpen] = useState(false);
	const { isConnected } = useAccount();
	const chainId = useChainId();
	const lastPrimaryClickRef = useRef<number>(0);
	const lastSecondaryClickRef = useRef<number>(0);
	const lastPrimarySuccessRef = useRef<number>(0);

	const APECHAIN_MAINNET = 33139;
	const APECHAIN_TESTNET = 33111;
	const isValidNetwork = chainId === APECHAIN_MAINNET || chainId === APECHAIN_TESTNET;

	const borrowEligibility = useBorrowEligibility({
		marketAddress: props.variant === 'borrow' ? props.marketAddress : undefined,
		tokenSymbol: props.variant === 'borrow' ? props.tokenSymbol : undefined,
		tokenDecimals: props.variant === 'borrow' ? (props as BorrowActionButtonProps).tokenDecimals : undefined,
	});

	const getWalletConnectionState = (additionalCheck?: () => boolean): ButtonState => {
		if (!isConnected) {
			return { disabled: true, text: 'Connect Wallet' };
		}
		if (!isValidNetwork) {
			return { disabled: true, text: 'Wrong Network' };
		}
		if (additionalCheck && !additionalCheck()) {
			return { disabled: true, text: 'Supply' };
		}
		return { disabled: false, text: '' };
	};

	const handlePrimaryAction = () => {
		const now = Date.now();
		const timeSinceLastClick = now - lastPrimaryClickRef.current;
		const timeSinceLastSuccess = now - lastPrimarySuccessRef.current;

		if (timeSinceLastClick < 500 && timeSinceLastSuccess > 2000) {
			return;
		}

		lastPrimaryClickRef.current = now;
		setPrimaryModalOpen(true);
		if (props.onAction) {
			props.onAction(props.marketAddress);
		}
	};

	const handleSecondaryAction = () => {
		const now = Date.now();
		const timeSinceLastClick = now - lastSecondaryClickRef.current;

		if (timeSinceLastClick < 500) {
			return;
		}

		lastSecondaryClickRef.current = now;
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
		if (borrowProps.hasBorrowed) {
			return {
				primary: {
					className: 'borrowButton',
					handler: handlePrimaryAction,
					state: borrowEligibility.canBorrow
						? { disabled: false, text: 'Borrow' }
						: { disabled: true, text: borrowEligibility.buttonText },
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
				state: borrowEligibility.canBorrow
					? { disabled: false, text: 'Borrow' }
					: { disabled: true, text: borrowEligibility.buttonText },
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

	const onPrimarySuccess = () => {
		lastPrimarySuccessRef.current = Date.now();
	};

	const onSecondarySuccess = () => {
		lastSecondaryClickRef.current = Date.now();
	};

	return {
		config,
		modals: {
			isPrimaryModalOpen,
			isSecondaryModalOpen,
			setPrimaryModalOpen,
			setSecondaryModalOpen,
		},
		callbacks: {
			onPrimarySuccess,
			onSecondarySuccess,
		},
	};
};
