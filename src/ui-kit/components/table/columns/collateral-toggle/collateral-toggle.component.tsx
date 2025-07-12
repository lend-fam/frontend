import { type FC, useCallback } from 'react';
import type { Address } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { COMPTROLLER_ABI, getComptrollerAddress } from '../../../../../contracts';
import { useChainId } from 'wagmi';

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
	const chainId = useChainId();
	const comptrollerAddress = getComptrollerAddress(chainId);
	const { writeContract: toggleCollateral, data: toggleHash, isPending: isTogglePending } = useWriteContract();
	const { isLoading: isToggleConfirming } = useWaitForTransactionReceipt({ hash: toggleHash });

	const handleToggle = useCallback(() => {
		if (!disabled && isEligible && comptrollerAddress) {
			if (isEnabled) {
				// Exit market (disable collateral)
				toggleCollateral({
					address: comptrollerAddress,
					abi: COMPTROLLER_ABI,
					functionName: 'exitMarket',
					args: [marketAddress],
				});
			} else {
				// Enter market (enable collateral)
				toggleCollateral({
					address: comptrollerAddress,
					abi: COMPTROLLER_ABI,
					functionName: 'enterMarkets',
					args: [[marketAddress]],
				});
			}

			if (onToggle) {
				onToggle(marketAddress, !isEnabled);
			}
		}
	}, [disabled, isEligible, isEnabled, marketAddress, onToggle, comptrollerAddress, toggleCollateral]);

	if (!isEligible) {
		return <div className={css.notEligible}>—</div>;
	}

	return (
		<div className={css.container}>
			<button
				type="button"
				className={`${css.toggle} ${isEnabled ? css.enabled : css.disabled}`}
				onClick={handleToggle}
				disabled={disabled || isTogglePending || isToggleConfirming}
				aria-label={`${isEnabled ? 'Disable' : 'Enable'} collateral`}>
				<div className={`${css.slider} ${isEnabled ? css.sliderEnabled : css.sliderDisabled}`} />
			</button>
		</div>
	);
};
