import { type FC, useCallback, useEffect, useState, useMemo } from 'react';
import type { Address } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract, useChainId } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { COMPTROLLER_ABI, getComptrollerAddress } from '../../../../../contracts';
import { useIsCollateralEnabled } from '../../../../../hooks/use-collateral-status.hook';
import { useUserMarkets } from '../../../../../hooks/use-market-core.hook';
import { useUserMarketPosition } from '../../../../../hooks/use-user-positions.hook';
import { Tooltip } from '../../../tooltip/tooltip.component';

import css from './collateral-toggle.module.css';

interface CollateralToggleProps {
	marketAddress: Address;
	isEnabled?: boolean;
	isEligible: boolean;
	disabled?: boolean;
}

export const CollateralToggle: FC<CollateralToggleProps> = ({
	marketAddress,
	isEnabled: isEnabledProp,
	isEligible,
	disabled = false,
}) => {
	const chainId = useChainId();
	const queryClient = useQueryClient();
	const { address: userAddress } = useAccount();
	const comptrollerAddress = getComptrollerAddress(chainId);
	const { writeContract: toggleCollateral, data: toggleHash, isPending: isTogglePending } = useWriteContract();
	const {
		isLoading: isToggleConfirming,
		isError: isToggleError,
		isSuccess: isToggleSuccess,
	} = useWaitForTransactionReceipt({
		hash: toggleHash,
	});

	const [isPendingToggle, setIsPendingToggle] = useState<boolean | null>(null);

	const actualIsEnabled = useIsCollateralEnabled(userAddress, marketAddress);

	const { queryKey: userMarketsQueryKey } = useUserMarkets(userAddress);

	const { data: userPosition } = useUserMarketPosition(marketAddress, userAddress);

	const borrowBalance = useMemo(() => {
		if (!userPosition?.[1]?.result) return 0n;
		return userPosition[1].result as bigint;
	}, [userPosition]);

	// Allow disabling collateral if debt is below dust threshold (0.000000001 tokens)
	const dustThreshold = 1000000000n; // 1e9 wei
	const hasOutstandingBorrows = borrowBalance > dustThreshold;

	const shouldDisableToggle = useMemo(() => {
		if (actualIsEnabled && hasOutstandingBorrows) {
			return true;
		}
		return disabled || !isEligible;
	}, [actualIsEnabled, hasOutstandingBorrows, disabled, isEligible]);

	const isEnabled = isPendingToggle !== null ? isPendingToggle : (isEnabledProp ?? actualIsEnabled);

	const handleToggle = useCallback(() => {
		if (!disabled && isEligible && comptrollerAddress) {
			const newPendingState = !isEnabled;
			setIsPendingToggle(newPendingState);

			if (isEnabled && borrowBalance > dustThreshold) {
				alert(
					`Cannot disable collateral: You have ${formatUnits(borrowBalance, 18)} tokens borrowed in this market. Please repay your borrows first.`,
				);
				setIsPendingToggle(null);
				return;
			}

			if (isEnabled) {
				toggleCollateral({
					address: comptrollerAddress,
					abi: COMPTROLLER_ABI,
					functionName: 'exitMarket',
					args: [marketAddress],
				});
			} else {
				toggleCollateral({
					address: comptrollerAddress,
					abi: COMPTROLLER_ABI,
					functionName: 'enterMarkets',
					args: [[marketAddress]],
				});
			}
		}
	}, [
		disabled,
		isEligible,
		isEnabled,
		marketAddress,
		comptrollerAddress,
		toggleCollateral,
		borrowBalance,
		hasOutstandingBorrows,
	]);

	const { refetch: manualRefetch } = useReadContract({
		address: comptrollerAddress,
		abi: COMPTROLLER_ABI,
		functionName: 'getAssetsIn',
		args: userAddress ? [userAddress] : undefined,
		query: {
			enabled: false,
		},
	});

	useEffect(() => {
		if (isToggleSuccess && userMarketsQueryKey) {
			queryClient.invalidateQueries({ queryKey: userMarketsQueryKey });

			manualRefetch().then((freshResult) => {
				const stillInArray = freshResult.data?.includes(marketAddress);
				const wasDisabling = isPendingToggle === false;

				if (wasDisabling && stillInArray) {
					alert(
						'Cannot disable collateral: You may have outstanding borrows in this market. Please repay your borrows first.',
					);
				}
			});

			setTimeout(() => {
				setIsPendingToggle(null);
			}, 2000);
		} else if (isToggleError) {
			setIsPendingToggle(null);
		}
	}, [
		isToggleSuccess,
		toggleHash,
		isToggleError,
		manualRefetch,
		marketAddress,
		queryClient,
		userMarketsQueryKey,
		isPendingToggle,
		userAddress,
	]);

	useEffect(() => {
		if (isToggleError) {
			alert('Collateral toggle failed. Please try again.');
		}
	}, [isToggleError]);

	if (!isEligible) {
		return <div className={css.notEligible}>—</div>;
	}

	const getTooltipContent = () => {
		if (!isEligible) {
			return 'This market is not eligible for collateral';
		}

		if (actualIsEnabled && borrowBalance > dustThreshold) {
			return 'Cannot disable collateral: You have outstanding borrows. Repay borrows first.';
		}

		if (actualIsEnabled) {
			return 'Click to disable collateral (stop using this asset as collateral for borrowing)';
		}

		return 'Click to enable collateral (use this asset as collateral for borrowing)';
	};

	return (
		<div className={css.container}>
			<Tooltip content={getTooltipContent()} position="top">
				<button
					type="button"
					className={`${css.toggle} ${isEnabled ? css.enabled : css.disabled} ${isPendingToggle !== null ? css.pending : ''} ${borrowBalance > dustThreshold && actualIsEnabled ? css.blocked : ''}`}
					onClick={handleToggle}
					disabled={shouldDisableToggle || isTogglePending || isToggleConfirming || isPendingToggle !== null}
					aria-label={`${isEnabled ? 'Disable' : 'Enable'} collateral`}>
					<div className={`${css.slider} ${isEnabled ? css.sliderEnabled : css.sliderDisabled}`} />
					{borrowBalance > dustThreshold && actualIsEnabled && <div className={css.blockIcon}>⚠️</div>}
				</button>
			</Tooltip>
		</div>
	);
};
