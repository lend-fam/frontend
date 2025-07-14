import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { Address } from 'viem';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, maxUint256 } from 'viem';
import { useQueryClient } from '@tanstack/react-query';

import { CTOKEN_ABI, ERC20_ABI } from '../../../contracts';
import { useAccountLiquidity } from '../../../hooks/use-account-liquidity.hook';
import { useMarketWalletBalances } from '../../../hooks/use-market-wallet-balances.hook';
import type {
	TransactionConfig,
	TransactionState,
	TokenData,
	BalanceData,
	ApprovalSettings,
} from './transaction.types';

function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

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
	const debouncedAmount = useDebounce(amount, 300);
	const [useMaxApproval, setUseMaxApproval] = useState(() => {
		const saved = localStorage.getItem('useMaxApproval');
		return saved !== null ? JSON.parse(saved) : true;
	});
	const [hasAutoProceeded, setHasAutoProceeded] = useState(false);
	const [transactionStarted, setTransactionStarted] = useState(false);
	const [isMaxButtonClicked, setIsMaxButtonClicked] = useState(false);
	const { address } = useAccount();
	const lastSuccessTimeRef = useRef<number>(0);
	const queryClient = useQueryClient();

	const {
		data: marketBalances,
		underlyingTokens,
		isLoading: balancesLoading,
	} = useMarketWalletBalances([marketAddress]);
	const walletBalance = marketBalances?.[marketAddress] || 0n;

	const underlyingToken = underlyingTokens?.[marketAddress];
	const isNativeToken = underlyingToken === 'native';
	const underlyingTokenAddress = isNativeToken ? undefined : (underlyingToken as Address);

	const { data: tokenDecimals } = useReadContract({
		address: underlyingTokenAddress,
		abi: ERC20_ABI,
		functionName: 'decimals',
		query: { enabled: !!underlyingTokenAddress && !isNativeToken },
	});

	const balance = useMemo(() => {
		if (balancesLoading) return undefined;

		return {
			decimals: isNativeToken ? 18 : tokenDecimals || 18,
			formatted: formatUnits(walletBalance, isNativeToken ? 18 : tokenDecimals || 18),
			symbol: isNativeToken ? 'APE' : undefined,
			value: walletBalance,
		};
	}, [walletBalance, isNativeToken, tokenDecimals, balancesLoading]);

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
		query: { enabled: !!address && !!underlyingTokenAddress && !isNativeToken && config.requiresApproval },
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
		const decimals = isNativeToken ? 18 : tokenDecimals || 18;
		if (!debouncedAmount) return 0n;
		try {
			let actualAmount: number;
			const pureNumber = parseFloat(debouncedAmount.replace(/,/g, ''));
			if (!isNaN(pureNumber) && isFinite(pureNumber)) {
				actualAmount = pureNumber;
			} else {
				actualAmount = parseCompactNotation(debouncedAmount);
			}

			if (actualAmount === 0 || !isFinite(actualAmount)) return 0n;

			const decimalString = actualAmount.toFixed(decimals);
			const result = parseUnits(decimalString, decimals);

			return result;
		} catch {
			return 0n;
		}
	}, [debouncedAmount, isNativeToken, tokenDecimals, parseCompactNotation]);

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
				if (!cTokenBalance || !exchangeRate) return 0n;
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
		borrowBalance,
	]);

	const isDustAmount = useMemo(() => {
		if (!borrowBalance) return false;
		// Consider amounts below 0.000000001 tokens (1e9 wei) as dust
		const dustThreshold = 1000000000n; // 1e9 wei  
		return borrowBalance <= dustThreshold;
	}, [borrowBalance]);

	const isMaxRepayAttempt = useMemo(() => {
		if (config.type !== 'repay' || !borrowBalance || !amountInWei) return false;
		
		// Always use max if the user clicked the "Max" button
		if (isMaxButtonClicked) return true;
		
		// Always use max for dust amounts to ensure complete cleanup
		if (isDustAmount) return true;
		
		// Consider it a max repay if amount is >= 99% of borrow balance (handles dust/precision issues)
		const dustThreshold = borrowBalance / 100n; // 1% threshold
		return amountInWei >= (borrowBalance - dustThreshold);
	}, [config.type, borrowBalance, amountInWei, isMaxButtonClicked, isDustAmount]);

	const needsApproval = useMemo(() => {
		if (!config.requiresApproval || !amountInWei || amountInWei === 0n) return false;
		if (isNativeToken) return false;
		const allowance = currentAllowance ?? 0n;

		if (isMaxRepayAttempt) {
			return allowance < maxUint256;
		}

		return allowance < amountInWei;
	}, [config.requiresApproval, currentAllowance, amountInWei, isMaxRepayAttempt, isNativeToken]);

	const isValidAmount = useMemo(() => {
		if (!debouncedAmount) return false;

		if (amountInWei <= 0n) return false;

		if (config.type === 'repay') {
			if (!balance || !borrowBalance) return false;

			const hasWalletBalance = balance.value >= amountInWei;
			const isValidPartialRepay = amountInWei <= borrowBalance;

			const isValid = hasWalletBalance && (isMaxRepayAttempt || isValidPartialRepay);

			return isValid;
		}

		const tolerance = maxAvailable > 1000n ? maxAvailable / 1000n : 1n;
		const maxWithTolerance = maxAvailable + tolerance;

		const isValid = amountInWei <= maxWithTolerance;
		return isValid;
	}, [debouncedAmount, amountInWei, maxAvailable, config.type, balance, borrowBalance]);

	const isProcessing = isApprovePending || isApproveConfirming || isTransactionPending || isTransactionConfirming;

	const executeMainTransaction = useCallback(() => {
		setTransactionStarted(true);
		switch (config.type) {
			case 'supply': {
				if (isNativeToken) {
					executeTransaction({
						address: marketAddress,
						abi: [
							...CTOKEN_ABI,
							{
								inputs: [],
								name: 'mint',
								outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
								stateMutability: 'payable',
								type: 'function',
							},
						],
						functionName: 'mint',
						value: amountInWei,
					});
				} else {
					executeTransaction({
						address: marketAddress,
						abi: CTOKEN_ABI,
						functionName: 'mint',
						args: [amountInWei],
					});
				}
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
				if (exchangeRate) {
					const maxWithdrawable = (cTokenBalance! * exchangeRate) / parseUnits('1', 18);
					const isMaxWithdraw = amountInWei >= maxWithdrawable;

					if (isMaxWithdraw) {
						executeTransaction({
							address: marketAddress,
							abi: CTOKEN_ABI,
							functionName: 'redeem',
							args: [cTokenBalance!],
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
				if (isNativeToken) {
					executeTransaction({
						address: marketAddress,
						abi: [
							...CTOKEN_ABI,
							{
								inputs: [],
								name: 'repayBorrow',
								outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
								stateMutability: 'payable',
								type: 'function',
							},
						],
						functionName: 'repayBorrow',
						value: amountInWei,
					});
				} else {
					const repayAmount = isMaxRepayAttempt ? maxUint256 : amountInWei;
					executeTransaction({
						address: marketAddress,
						abi: CTOKEN_ABI,
						functionName: 'repayBorrow',
						args: [repayAmount],
					});
				}
				break;
			}
		}
	}, [config.type, executeTransaction, marketAddress, amountInWei, exchangeRate, borrowBalance, cTokenBalance, isNativeToken, isMaxRepayAttempt]);

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
								return false;
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
			}, 50);

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
			setIsMaxButtonClicked(false);
		}
	}, [isOpen]);

	useEffect(() => {
		if (config.type === 'repay') {
			setHasAutoProceeded(false);
		}
		// Reset max button flag when user manually changes amount
		if (debouncedAmount !== amount) {
			setIsMaxButtonClicked(false);
		}
	}, [debouncedAmount, config.type, amount]);

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
		const decimals = isNativeToken ? 18 : tokenDecimals || 18;
		if (maxAvailable > 0n) {
			const formatted = formatUnits(maxAvailable, decimals);

			let finalAmount: string;
			if (config.type === 'repay' || config.type === 'withdraw') {
				finalAmount = formatted;
			} else {
				const number = parseFloat(formatted);
				finalAmount = number.toFixed(Math.min(8, decimals));
			}

			setAmount(finalAmount);
			setIsMaxButtonClicked(true);
		}
	};

	const handleCleanDust = () => {
		if (config.type === 'repay' && isDustAmount && borrowBalance) {
			const decimals = isNativeToken ? 18 : tokenDecimals || 18;
			const formatted = formatUnits(borrowBalance, decimals);
			setAmount(formatted);
			setIsMaxButtonClicked(true);
		}
	};

	const handleApprove = () => {
		if (!underlyingTokenAddress || !isValidAmount) {
			return;
		}

		const approvalAmount = useMaxApproval || isMaxRepayAttempt ? maxUint256 : amountInWei;
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
		tokenDecimals: isNativeToken ? 18 : tokenDecimals,
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
		handleCleanDust,
		isDustAmount,
	};
};
