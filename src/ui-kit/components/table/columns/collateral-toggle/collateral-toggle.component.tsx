import { type FC, useCallback, useEffect, useState, useMemo } from 'react';
import type { Address } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { COMPTROLLER_ABI, getComptrollerAddress } from '../../../../../contracts';
import { useChainId } from 'wagmi';
import { useIsCollateralEnabled } from '../../../../../hooks/use-collateral-status.hook';
import { useUserMarkets, useUserMarketPosition } from '../../../../../hooks/use-markets.hook';
import { Tooltip } from '../../../tooltip/tooltip.component';
import { formatUnits } from 'viem';

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

	const hasOutstandingBorrows = borrowBalance > 0n;

	const shouldDisableToggle = useMemo(() => {
		if (actualIsEnabled && hasOutstandingBorrows) {
			return true;
		}
		return disabled || !isEligible;
	}, [actualIsEnabled, hasOutstandingBorrows, disabled, isEligible]);

	const isEnabled = isPendingToggle !== null ? isPendingToggle : (isEnabledProp ?? actualIsEnabled);

	useEffect(() => {
		console.log('CollateralToggle state:', {
			marketAddress,
			userAddress,
			actualIsEnabled,
			isEnabledProp,
			isPendingToggle,
			finalIsEnabled: isEnabled,
		});
	}, [marketAddress, userAddress, actualIsEnabled, isEnabledProp, isPendingToggle, isEnabled]);

	useEffect(() => {
		if (toggleHash) {
			console.log('CollateralToggle: Transaction hash received:', toggleHash);
		}
	}, [toggleHash]);

	useEffect(() => {
		if (isTogglePending) {
			console.log('CollateralToggle: Transaction pending...');
		}
	}, [isTogglePending]);

	useEffect(() => {
		if (isToggleConfirming) {
			console.log('CollateralToggle: Transaction confirming...');
		}
	}, [isToggleConfirming]);

	const handleToggle = useCallback(() => {
		if (!disabled && isEligible && comptrollerAddress) {
			const newPendingState = !isEnabled;
			setIsPendingToggle(newPendingState);

			console.log('CollateralToggle: Starting transaction:', {
				currentState: isEnabled,
				pendingState: newPendingState,
				action: isEnabled ? 'exitMarket' : 'enterMarkets',
				marketAddress,
				comptrollerAddress,
			});

			if (isEnabled && hasOutstandingBorrows) {
				console.log('❌ Cannot exit market: User has outstanding borrows');
				console.log('Borrow balance:', formatUnits(borrowBalance, 18));
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
			console.log('🔄 Transaction successful! Effect triggered');
			console.log('📋 Current effect dependencies:', {
				isToggleSuccess,
				hasUserMarketsQueryKey: !!userMarketsQueryKey,
				toggleHash,
			});

			queryClient.invalidateQueries({ queryKey: userMarketsQueryKey });
			console.log('✅ Query invalidation called');

			console.log('⏱️ Checking if exitMarket actually worked...');
			manualRefetch().then((freshResult) => {
				const stillInArray = freshResult.data?.includes(marketAddress);
				console.log('🔍 IMMEDIATE blockchain check result:', {
					markets: freshResult.data?.map((addr) => addr.slice(0, 10) + '...'),
					includesOurMarket: stillInArray,
					ourMarket: marketAddress.slice(0, 10) + '...',
					actualResult: stillInArray ? 'STILL IN ARRAY (BAD)' : 'REMOVED FROM ARRAY (GOOD)',
				});

				if (stillInArray) {
					console.error('❌ exitMarket FAILED! Likely reasons:');
					console.error('1. Outstanding borrow balance in this market');
					console.error('2. Insufficient collateral in other markets');
					console.error('3. Market-specific restrictions');
					console.error('Check borrowBalanceStored for this market and user');

					alert(
						'Cannot disable collateral: You may have outstanding borrows in this market. Please repay your borrows first.',
					);
				}
			});

			setTimeout(() => {
				console.log('🧹 Clearing pending state');
				setIsPendingToggle(null);
			}, 2000);
		} else if (isToggleError) {
			console.log('❌ Transaction failed!');
			setIsPendingToggle(null);
		}
	}, [isToggleSuccess, toggleHash, isToggleError, manualRefetch, marketAddress, queryClient, userMarketsQueryKey]);

	useEffect(() => {
		if (isToggleError) {
			console.log('CollateralToggle: Toggle transaction failed');
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

		if (actualIsEnabled && hasOutstandingBorrows) {
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
					className={`${css.toggle} ${isEnabled ? css.enabled : css.disabled} ${isPendingToggle !== null ? css.pending : ''} ${hasOutstandingBorrows && actualIsEnabled ? css.blocked : ''}`}
					onClick={handleToggle}
					disabled={shouldDisableToggle || isTogglePending || isToggleConfirming || isPendingToggle !== null}
					aria-label={`${isEnabled ? 'Disable' : 'Enable'} collateral`}>
					<div className={`${css.slider} ${isEnabled ? css.sliderEnabled : css.sliderDisabled}`} />
					{hasOutstandingBorrows && actualIsEnabled && <div className={css.blockIcon}>⚠️</div>}
				</button>
			</Tooltip>
		</div>
	);
};
