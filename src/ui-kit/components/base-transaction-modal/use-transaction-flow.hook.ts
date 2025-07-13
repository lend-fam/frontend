import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { Address } from 'viem';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, maxUint256 } from 'viem';
import { useQueryClient } from '@tanstack/react-query';

import { CTOKEN_ABI, ERC20_ABI } from '../../../contracts';
import { useAccountLiquidity } from '../../../hooks/use-account-liquidity.hook';
import type {
	TransactionConfig,
	TransactionState,
	TokenData,
	BalanceData,
	ApprovalSettings,
} from './transaction.types';

interface UseTransactionFlowParams {
	marketAddress: Address;
	config: TransactionConfig;
	isOpen: boolean;
	onClose: () => void;
	availableLiquidity?: bigint;
	onSuccess?: () => void;
}

export const useTransactionFlow = ({
	marketAddress,
	config,
	isOpen,
	onClose,
	availableLiquidity,
	onSuccess,
}: UseTransactionFlowParams) => {
	const [amount, setAmount] = useState('');
	const [useMaxApproval, setUseMaxApproval] = useState(() => {
		const saved = localStorage.getItem('useMaxApproval');
		return saved !== null ? JSON.parse(saved) : true;
	});
	const [hasAutoProceeded, setHasAutoProceeded] = useState(false);
	const [transactionStarted, setTransactionStarted] = useState(false);
	const { address } = useAccount();
	const lastSuccessTimeRef = useRef<number>(0);
	const queryClient = useQueryClient();

	const { data: underlyingTokenAddress } = useReadContract({
		address: marketAddress,
		abi: CTOKEN_ABI,
		functionName: 'underlying',
	});

	const { data: tokenDecimals } = useReadContract({
		address: underlyingTokenAddress,
		abi: ERC20_ABI,
		functionName: 'decimals',
		query: { enabled: !!underlyingTokenAddress },
	});

	const { data: balance } = useBalance({
		address,
		token: underlyingTokenAddress,
		query: { enabled: !!underlyingTokenAddress && (config.type === 'supply' || config.type === 'repay') },
	});

	const { data: cTokenBalance } = useReadContract({
		address: marketAddress,
		abi: CTOKEN_ABI,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
		query: { enabled: !!address && config.type === 'withdraw' },
	});

	const { data: exchangeRate } = useReadContract({
		address: marketAddress,
		abi: CTOKEN_ABI,
		functionName: 'exchangeRateStored',
		query: { enabled: config.type === 'withdraw' },
	});

	const { data: borrowBalance } = useReadContract({
		address: marketAddress,
		abi: CTOKEN_ABI,
		functionName: 'borrowBalanceStored',
		args: address ? [address] : undefined,
		query: { enabled: !!address && config.type === 'repay' },
	});

	const { data: accountLiquidity } = useAccountLiquidity(address);

	const { data: currentAllowance } = useReadContract({
		address: underlyingTokenAddress,
		abi: ERC20_ABI,
		functionName: 'allowance',
		args: address && underlyingTokenAddress ? [address, marketAddress] : undefined,
		query: { enabled: !!address && !!underlyingTokenAddress && config.requiresApproval },
	});

	const { writeContract: approve, data: approveHash, isPending: isApprovePending } = useWriteContract();
	const {
		isLoading: isApproveConfirming,
		isSuccess: isApproveSuccess,
		isError: isApproveError,
	} = useWaitForTransactionReceipt({ hash: approveHash });

	const {
		writeContract: executeTransaction,
		data: transactionHash,
		isPending: isTransactionPending,
	} = useWriteContract();
	const {
		isLoading: isTransactionConfirming,
		isSuccess: isTransactionSuccess,
		isError: isTransactionError,
	} = useWaitForTransactionReceipt({ hash: transactionHash });

	const parseCompactNotation = useCallback((value: string): number => {
		if (!value || value === '') return 0;

		const cleanValue = value.replace(/,/g, '').trim();
		const lastChar = cleanValue.slice(-1).toLowerCase();
		const numericPart = cleanValue.slice(0, -1);

		let multiplier = 1;
		let numberStr = cleanValue;

		if (lastChar === 'k') {
			multiplier = 1000;
			numberStr = numericPart;
		} else if (lastChar === 'm') {
			multiplier = 1000000;
			numberStr = numericPart;
		} else if (lastChar === 'b') {
			multiplier = 1000000000;
			numberStr = numericPart;
		}

		const baseNumber = parseFloat(numberStr);
		if (isNaN(baseNumber)) return 0;

		return baseNumber * multiplier;
	}, []);

	const amountInWei = useMemo(() => {
		if (!amount || !tokenDecimals) return 0n;
		try {
			let actualAmount: number;
			const pureNumber = parseFloat(amount.replace(/,/g, ''));
			if (!isNaN(pureNumber) && isFinite(pureNumber)) {
				actualAmount = pureNumber;
			} else {
				actualAmount = parseCompactNotation(amount);
			}

			if (actualAmount === 0 || !isFinite(actualAmount)) return 0n;

			const decimalString = actualAmount.toFixed(tokenDecimals);
			const result = parseUnits(decimalString, tokenDecimals);

			return result;
		} catch {
			return 0n;
		}
	}, [amount, tokenDecimals, parseCompactNotation]);

	const maxAvailable = useMemo(() => {
		switch (config.type) {
			case 'supply': {
				return balance?.value ?? 0n;
			}
			case 'borrow': {
				if (!accountLiquidity || !availableLiquidity) return 0n;
				const [, liquidity] = accountLiquidity as [bigint, bigint, bigint];
				return liquidity && liquidity > 0n && liquidity < availableLiquidity ? liquidity : availableLiquidity;
			}
			case 'withdraw': {
				if (!cTokenBalance || !exchangeRate || !tokenDecimals) return 0n;
				return (cTokenBalance * exchangeRate) / parseUnits('1', 18);
			}
			case 'repay': {
				if (!balance || !borrowBalance) return 0n;
				return balance.value < borrowBalance ? balance.value : borrowBalance;
			}
			default: {
				return 0n;
			}
		}
	}, [
		config.type,
		balance,
		accountLiquidity,
		availableLiquidity,
		cTokenBalance,
		exchangeRate,
		tokenDecimals,
		borrowBalance,
	]);

	const needsApproval = useMemo(() => {
		if (!config.requiresApproval || !amountInWei || amountInWei === 0n) return false;
		const allowance = currentAllowance ?? 0n;

		if (config.type === 'repay' && borrowBalance && amountInWei >= borrowBalance) {
			return allowance < maxUint256;
		}

		return allowance < amountInWei;
	}, [config.requiresApproval, currentAllowance, amountInWei, config.type, borrowBalance]);

	const isValidAmount = useMemo(() => {
		if (!amount) return false;

		if (amountInWei <= 0n) return false;

		if (config.type === 'repay') {
			if (!balance || !borrowBalance) return false;

			const hasWalletBalance = balance.value >= amountInWei;

			const isMaxRepayAttempt = amountInWei >= borrowBalance;
			const isValidPartialRepay = amountInWei <= borrowBalance;

			const isValid = hasWalletBalance && (isMaxRepayAttempt || isValidPartialRepay);

			return isValid;
		}

		const tolerance = maxAvailable > 1000n ? maxAvailable / 1000n : 1n;
		const maxWithTolerance = maxAvailable + tolerance;

		return amountInWei <= maxWithTolerance;
	}, [amount, amountInWei, maxAvailable, config.type, balance, borrowBalance]);

	const isProcessing = isApprovePending || isApproveConfirming || isTransactionPending || isTransactionConfirming;

	const executeMainTransaction = useCallback(() => {
		setTransactionStarted(true);
		switch (config.type) {
			case 'supply': {
				executeTransaction({
					address: marketAddress,
					abi: CTOKEN_ABI,
					functionName: 'mint',
					args: [amountInWei],
				});
				break;
			}
			case 'borrow': {
				executeTransaction({
					address: marketAddress,
					abi: CTOKEN_ABI,
					functionName: 'borrow',
					args: [amountInWei],
				});
				break;
			}
			case 'withdraw': {
				if (exchangeRate && tokenDecimals) {
					const maxWithdrawable = (cTokenBalance! * exchangeRate) / parseUnits('1', 18);
					const isMaxWithdraw = amountInWei >= maxWithdrawable;

					if (isMaxWithdraw) {
						executeTransaction({
							address: marketAddress,
							abi: CTOKEN_ABI,
							functionName: 'redeem',
							args: [cTokenBalance],
						});
					} else {
						const cTokensToRedeem = (amountInWei * parseUnits('1', 18)) / exchangeRate;
						executeTransaction({
							address: marketAddress,
							abi: CTOKEN_ABI,
							functionName: 'redeem',
							args: [cTokensToRedeem],
						});
					}
				}
				break;
			}
			case 'repay': {
				const isMaxRepay = borrowBalance && amountInWei >= borrowBalance;
				const repayAmount = isMaxRepay ? maxUint256 : amountInWei;

				executeTransaction({
					address: marketAddress,
					abi: CTOKEN_ABI,
					functionName: 'repayBorrow',
					args: [repayAmount],
				});
				break;
			}
		}
	}, [
		config.type,
		executeTransaction,
		marketAddress,
		amountInWei,
		exchangeRate,
		tokenDecimals,
		borrowBalance,
		cTokenBalance,
	]);

	useEffect(() => {
		if (
			isOpen &&
			isApproveSuccess &&
			!isTransactionPending &&
			!isTransactionConfirming &&
			isValidAmount &&
			!hasAutoProceeded &&
			config.requiresApproval &&
			transactionStarted
		) {
			setHasAutoProceeded(true);
			executeMainTransaction();
		}
	}, [
		isOpen,
		isApproveSuccess,
		isTransactionPending,
		isTransactionConfirming,
		isValidAmount,
		hasAutoProceeded,
		config.requiresApproval,
		config.type,
		transactionStarted,
		executeMainTransaction,
	]);

	useEffect(() => {
		if (isTransactionSuccess && isOpen && transactionStarted) {
			lastSuccessTimeRef.current = Date.now();
			setHasAutoProceeded(false);
			setTransactionStarted(false);

			queryClient.invalidateQueries({
				predicate: (query) => {
					const queryKey = query.queryKey;
					if (!queryKey || !Array.isArray(queryKey)) return false;

					const keyString = JSON.stringify(queryKey).toLowerCase();

					return (
						keyString.includes('userborrow') ||
						keyString.includes('accountliquidity') ||
						((queryKey[0] === 'readContract' || queryKey[0] === 'readContracts') &&
							keyString.includes(address?.toLowerCase() || ''))
					);
				},
			});

			setTimeout(async () => {
				await Promise.all([
					queryClient.invalidateQueries({
						predicate: (query) => {
							const queryKey = query.queryKey;
							if (!queryKey || !Array.isArray(queryKey)) return false;

							const keyString = JSON.stringify(queryKey).toLowerCase();

							if (queryKey[0] === 'readContract' || queryKey[0] === 'readContracts') {
								return (
									keyString.includes(address?.toLowerCase() || '') ||
									keyString.includes(marketAddress.toLowerCase())
								);
							}

							if (queryKey[0] === 'balance' && keyString.includes(address?.toLowerCase() || '')) {
								return true;
							}

							return (
								keyString.includes('userborrow') ||
								keyString.includes('usersupply') ||
								keyString.includes('accountliquidity') ||
								keyString.includes('marketsavailable') ||
								keyString.includes('usermarkets') ||
								keyString.includes('usdbalances') ||
								keyString.includes('marketwallet') ||
								keyString.includes('borrowbalancestored') ||
								keyString.includes('balanceofunderlying')
							);
						},
					}),

					queryClient.refetchQueries({
						predicate: (query) => {
							const queryKey = query.queryKey;
							if (!queryKey || !Array.isArray(queryKey)) return false;

							const keyString = JSON.stringify(queryKey).toLowerCase();

							return (
								keyString.includes('userborrow') ||
								keyString.includes('accountliquidity') ||
								keyString.includes('borrowbalancestored') ||
								(queryKey[0] === 'readContracts' && keyString.includes(address?.toLowerCase() || ''))
							);
						},
					}),
				]);
			}, 50); // Reduced delay for faster response

			if (onSuccess) {
				onSuccess();
			}
			onClose();
		}
	}, [
		isTransactionSuccess,
		isOpen,
		transactionStarted,
		onClose,
		onSuccess,
		config.type,
		queryClient,
		address,
		marketAddress,
	]);

	useEffect(() => {
		if (isOpen) {
			setHasAutoProceeded(false);
			setTransactionStarted(false);
			setAmount('');
		}
	}, [isOpen]);

	useEffect(() => {
		if (config.type === 'repay') {
			setHasAutoProceeded(false);
		}
	}, [amount, config.type]);

	useEffect(() => {
		if (isApproveError) {
			setHasAutoProceeded(false);
			alert('Token approval failed. Please try again.');
		}
	}, [isApproveError, config.type]);

	useEffect(() => {
		if (isTransactionError) {
			setHasAutoProceeded(false);
			alert(`${config.type} transaction failed. Please try again.`);
		}
	}, [isTransactionError, config.type]);

	const handleMaxClick = () => {
		if (maxAvailable > 0n && tokenDecimals) {
			const formatted = formatUnits(maxAvailable, tokenDecimals);

			let finalAmount: string;
			if (config.type === 'repay' || config.type === 'withdraw') {
				finalAmount = formatted;
			} else {
				const number = parseFloat(formatted);
				finalAmount = number.toFixed(Math.min(8, tokenDecimals));
			}

			setAmount(finalAmount);
		}
	};

	const handleApprove = () => {
		if (!underlyingTokenAddress || !isValidAmount) {
			return;
		}

		const isMaxRepay = config.type === 'repay' && borrowBalance && amountInWei >= borrowBalance;
		const approvalAmount = useMaxApproval || isMaxRepay ? maxUint256 : amountInWei;
		setTransactionStarted(true);
		approve({
			address: underlyingTokenAddress,
			abi: ERC20_ABI,
			functionName: 'approve',
			args: [marketAddress, approvalAmount],
		});
	};

	const handleSubmit = () => {
		if (!isValidAmount) {
			return;
		}

		if (needsApproval) {
			handleApprove();
		} else {
			executeMainTransaction();
		}
	};

	const handleApprovalSettingChange = (checked: boolean) => {
		setUseMaxApproval(checked);
		localStorage.setItem('useMaxApproval', JSON.stringify(checked));
	};

	const transactionState: TransactionState = {
		isProcessing,
		hasAutoProceeded,
		needsApproval,
		isApprovePending,
		isApproveConfirming,
		isApproveSuccess,
		isApproveError,
		isTransactionPending,
		isTransactionConfirming,
		isTransactionSuccess,
		isTransactionError,
	};

	const tokenData: TokenData = {
		underlyingTokenAddress,
		tokenDecimals,
		cleanSymbol: '',
	};

	const balanceData: BalanceData = {
		walletBalance: balance?.value,
		balance,
		availableToBorrow: config.type === 'borrow' ? maxAvailable : undefined,
		accountLiquidity: accountLiquidity ? ([...accountLiquidity] as [bigint, bigint, bigint]) : undefined,
		availableLiquidity,
		cTokenBalance,
		exchangeRate,
		maxWithdrawable: config.type === 'withdraw' ? maxAvailable : undefined,
		borrowBalance,
		maxRepayable: config.type === 'repay' ? maxAvailable : undefined,
	};

	const approvalSettings: ApprovalSettings = {
		useMaxApproval,
		currentAllowance,
	};

	return {
		amount,
		setAmount,
		transactionState,
		tokenData,
		balanceData,
		approvalSettings,
		amountInWei,
		maxAvailable,
		isValidAmount,
		lastSuccessTime: lastSuccessTimeRef.current,
		handleMaxClick,
		handleSubmit,
		handleApprovalSettingChange,
	};
};
