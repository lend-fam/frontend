import { type FC, useCallback } from 'react';
import type { Address } from 'viem';

import css from './collateral-toggle.module.css';

interface CollateralToggleProps {
	marketAddress: Address;
	isEnabled: boolean;
	isEligible: boolean;
	onToggle?: (marketAddress: Address, enabled: boolean) => void;
	disabled?: boolean;
}

export const CollateralToggle: FC<CollateralToggleProps> = ({
	marketAddress,
	isEnabled,
	isEligible,
	onToggle,
	disabled = false,
}) => {
	const handleToggle = useCallback(() => {
		if (!disabled && isEligible && onToggle) {
			onToggle(marketAddress, !isEnabled);
		}
	}, [disabled, isEligible, isEnabled, marketAddress, onToggle]);

	if (!isEligible) {
		return <div className={css.notEligible}>—</div>;
	}

	return (
		<div className={css.container}>
			<button
				type="button"
				className={`${css.toggle} ${isEnabled ? css.enabled : css.disabled}`}
				onClick={handleToggle}
				disabled={disabled}
				aria-label={`${isEnabled ? 'Disable' : 'Enable'} collateral`}>
				<div className={`${css.slider} ${isEnabled ? css.sliderEnabled : css.sliderDisabled}`} />
			</button>
		</div>
	);
};
