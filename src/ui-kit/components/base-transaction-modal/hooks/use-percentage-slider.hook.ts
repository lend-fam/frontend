import { useState, useCallback, useRef, useEffect } from 'react';
import { parseUnits, formatUnits } from 'viem';

interface UsePercentageSliderProps {
	balance?: { value: bigint };
	tokenDecimals?: number;
	amount: string;
	setAmount: (amount: string) => void;
	isOpen: boolean;
	isProcessing?: boolean;
}

export function usePercentageSlider({
	balance,
	tokenDecimals,
	amount,
	setAmount,
	isOpen,
	isProcessing,
}: UsePercentageSliderProps) {
	const sliderRef = useRef<HTMLInputElement>(null);
	const isDraggingRef = useRef(false);
	const [sliderValue, setSliderValue] = useState(0);

	const calculatePercentage = useCallback(
		(inputAmount: string): number => {
			if (!inputAmount || !tokenDecimals || inputAmount === '0' || inputAmount === '') {
				return 0;
			}

			try {
				const pureNumber = parseFloat(inputAmount.replace(/,/g, ''));
				if (isNaN(pureNumber) || !balance) return 0;

				const amountInWei = parseUnits(pureNumber.toString(), tokenDecimals);
				const maxBalance = balance.value;

				if (maxBalance === 0n) return 0;

				const percentage = (Number(amountInWei) / Number(maxBalance)) * 100;
				return Math.min(100, Math.max(0, Math.round(percentage)));
			} catch {
				return 0;
			}
		},
		[tokenDecimals, balance],
	);

	const calculateAmountFromPercentage = useCallback(
		(percentage: number): string => {
			if (!tokenDecimals || !balance) return '0';

			const maxBalance = balance.value;
			if (maxBalance === 0n) return '0';

			const targetAmount = (maxBalance * BigInt(percentage)) / 100n;
			const pureNumber = formatUnits(targetAmount, tokenDecimals);
			const numericValue = parseFloat(pureNumber);

			return numericValue.toFixed(Math.min(8, tokenDecimals));
		},
		[tokenDecimals, balance],
	);

	const updateSliderFromPercentage = (percentage: number) => {
		setSliderValue(percentage);
		if (sliderRef.current) {
			sliderRef.current.value = percentage.toString();
			sliderRef.current.style.setProperty('--fill-percent', `${percentage}%`);
		}
		const newAmount = percentage === 0 ? '0' : calculateAmountFromPercentage(percentage);
		setAmount(newAmount);
	};

	// Sync slider with amount input
	useEffect(() => {
		if (!isDraggingRef.current) {
			const newPercentage = calculatePercentage(amount);
			setSliderValue(newPercentage);

			if (sliderRef.current) {
				sliderRef.current.value = newPercentage.toString();
				sliderRef.current.style.setProperty('--fill-percent', `${newPercentage}%`);
			}
		}
	}, [amount, calculatePercentage]);

	// Reset on modal close
	useEffect(() => {
		if (!isOpen) {
			isDraggingRef.current = false;
			setSliderValue(0);
			if (sliderRef.current) {
				sliderRef.current.value = '0';
				sliderRef.current.style.setProperty('--fill-percent', '0%');
			}
		}
	}, [isOpen]);

	// Global event listeners for drag state
	useEffect(() => {
		const handleGlobalMouseUp = () => {
			isDraggingRef.current = false;
		};

		const handleGlobalTouchEnd = () => {
			isDraggingRef.current = false;
		};

		document.addEventListener('mouseup', handleGlobalMouseUp);
		document.addEventListener('touchend', handleGlobalTouchEnd);

		return () => {
			document.removeEventListener('mouseup', handleGlobalMouseUp);
			document.removeEventListener('touchend', handleGlobalTouchEnd);
		};
	}, []);

	return {
		sliderRef,
		isDraggingRef,
		sliderValue,
		setSliderValue,
		calculatePercentage,
		calculateAmountFromPercentage,
		updateSliderFromPercentage,
		isProcessing,
	};
}
