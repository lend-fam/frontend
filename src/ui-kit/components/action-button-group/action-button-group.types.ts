import type { Address } from 'viem';

export type ActionButtonVariant = 'supply' | 'borrow';

export interface BaseActionButtonProps {
	marketAddress: Address;
	tokenSymbol: string;
	onAction?: (marketAddress: Address) => void;
	onSecondaryAction?: (marketAddress: Address) => void;
	onTertiaryAction?: (marketAddress: Address) => void;
}

export interface SupplyActionButtonProps extends BaseActionButtonProps {
	variant: 'supply';
	hasSupplied: boolean;
	supplyAPY: string;
	isCollateralEnabled?: boolean;
	walletBalance?: bigint;
	showMoreMenu?: boolean;
}

export interface BorrowActionButtonProps extends BaseActionButtonProps {
	variant: 'borrow';
	hasBorrowed: boolean;
	borrowAPY: string;
	availableLiquidity: bigint;
}

export type ActionButtonGroupProps = SupplyActionButtonProps | BorrowActionButtonProps;

export interface ButtonState {
	disabled: boolean;
	text: string;
}

export interface ActionButtonConfig {
	primary: {
		className: string;
		handler: () => void;
		state?: ButtonState;
	};
	secondary: {
		className: string;
		handler: () => void;
		text: string;
		state?: ButtonState;
	};
	tertiary?: {
		className: string;
		handler: () => void;
		text: string;
		ariaLabel?: string;
	};
}