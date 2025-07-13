import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { Address } from 'viem';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, maxUint256 } from 'viem';

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

	// Token data
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

	// Balance data based on transaction type
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

	// Contract write hooks
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

			return parseUnits(actualAmount.toString(), tokenDecimals);
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
		return allowance < amountInWei;
	}, [config.requiresApproval, currentAllowance, amountInWei]);

	const isValidAmount = useMemo(() => {
		if (!amount) return false;

		if (amountInWei <= 0n) return false;

		const tolerance = maxAvailable / 1000n;
		const maxWithTolerance = maxAvailable + tolerance;

		return amountInWei <= maxWithTolerance;
	}, [amount, amountInWei, maxAvailable]);

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
					const cTokensToRedeem = (amountInWei * parseUnits('1', 18)) / exchangeRate;
					executeTransaction({
						address: marketAddress,
						abi: CTOKEN_ABI,
						functionName: 'redeem',
						args: [cTokensToRedeem],
					});
				}
				break;
			}
			case 'repay': {
				executeTransaction({
					address: marketAddress,
					abi: CTOKEN_ABI,
					functionName: 'repayBorrow',
					args: [amountInWei],
				});
				break;
			}
		}
	}, [config.type, executeTransaction, marketAddress, amountInWei, exchangeRate, tokenDecimals]);

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
			if (onSuccess) {
				onSuccess();
			}
			onClose();
		}
	}, [isTransactionSuccess, isOpen, transactionStarted, onClose, onSuccess, config.type]);

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
			const number = parseFloat(formatted);
			setAmount(number.toFixed(Math.min(8, tokenDecimals)));
		}
	};

	const handleApprove = () => {
		if (!underlyingTokenAddress || !isValidAmount) {
			return;
		}

		const approvalAmount = useMaxApproval ? maxUint256 : amountInWei;
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
