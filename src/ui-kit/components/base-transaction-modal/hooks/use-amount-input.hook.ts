import { useState, useMemo } from 'react';
import { parseUnits, formatUnits } from 'viem';

interface UseAmountInputProps {
	balance?: { value: bigint };
	tokenDecimals?: number;
	isProcessing?: boolean;
}

export function useAmountInput({ balance, tokenDecimals, isProcessing }: UseAmountInputProps) {
	const [amount, setAmount] = useState('');

	const amountInWei = useMemo(() => {
		if (!amount || isNaN(Number(amount)) || !tokenDecimals) return 0n;
		try {
			return parseUnits(amount, tokenDecimals);
		} catch {
			return 0n;
		}
	}, [amount, tokenDecimals]);

	const isValidAmount = useMemo(() => {
		if (!amount || !balance) return false;
		return amountInWei > 0n && amountInWei <= balance.value;
	}, [amount, balance, amountInWei]);

	const handleMaxClick = () => {
		if (balance && tokenDecimals && !isProcessing) {
			const formatted = formatUnits(balance.value, tokenDecimals);
			const number = parseFloat(formatted);
			setAmount(number.toFixed(Math.min(8, tokenDecimals)));
		}
	};

	const reset = () => setAmount('');

	return {
		amount,
		setAmount,
		amountInWei,
		isValidAmount,
		handleMaxClick,
		reset,
	};
}
