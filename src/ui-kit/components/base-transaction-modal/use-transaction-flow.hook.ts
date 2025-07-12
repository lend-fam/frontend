import { useState, useMemo, useEffect, useCallback } from 'react';
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
	ApprovalSettings 
} from './transaction.types';

interface UseTransactionFlowParams {
	marketAddress: Address;
	config: TransactionConfig;
	isOpen: boolean;
	onClose: () => void;
	availableLiquidity?: bigint;
}

export const useTransactionFlow = ({
	marketAddress,
	config,
	isOpen,
	onClose,
	availableLiquidity,
}: UseTransactionFlowParams) => {
	const [amount, setAmount] = useState('');
	const [useMaxApproval, setUseMaxApproval] = useState(() => {
		const saved = localStorage.getItem('useMaxApproval');
		return saved !== null ? JSON.parse(saved) : true;
	});
	const [hasAutoProceeded, setHasAutoProceeded] = useState(false);
	const { address } = useAccount();

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

	const { writeContract: executeTransaction, data: transactionHash, isPending: isTransactionPending } = useWriteContract();
	const {
		isLoading: isTransactionConfirming,
		isSuccess: isTransactionSuccess,
		isError: isTransactionError,
	} = useWaitForTransactionReceipt({ hash: transactionHash });

	// Computed values
	const amountInWei = useMemo(() => {
		if (!amount || isNaN(Number(amount)) || !tokenDecimals) return 0n;
		try {
			return parseUnits(amount, tokenDecimals);
		} catch {
			return 0n;
		}
	}, [amount, tokenDecimals]);

	// Calculate max available amount based on transaction type
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
	}, [config.type, balance, accountLiquidity, availableLiquidity, cTokenBalance, exchangeRate, tokenDecimals, borrowBalance]);

	const needsApproval = useMemo(() => {
		if (!config.requiresApproval || !amountInWei || amountInWei === 0n) return false;
		const allowance = currentAllowance ?? 0n;
		return allowance < amountInWei;
	}, [config.requiresApproval, currentAllowance, amountInWei]);

	const isValidAmount = useMemo(() => {
		if (!amount) return false;
		return amountInWei > 0n && amountInWei <= maxAvailable;
	}, [amount, amountInWei, maxAvailable]);

	const isProcessing = isApprovePending || isApproveConfirming || isTransactionPending || isTransactionConfirming;

	// Define the main transaction execution function
	const executeMainTransaction = useCallback(() => {
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

	// Auto-progression logic for approval flow
	useEffect(() => {
		console.log(`${config.type}: Auto-proceed effect triggered`, {
			isOpen,
			isApproveSuccess,
			isTransactionPending,
			isTransactionConfirming,
			isValidAmount,
			hasAutoProceeded,
		});

		if (
			isOpen &&
			isApproveSuccess &&
			!isTransactionPending &&
			!isTransactionConfirming &&
			isValidAmount &&
			!hasAutoProceeded &&
			config.requiresApproval
		) {
			console.log(`${config.type}: Auto-proceeding with transaction after approval success`);
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
		executeMainTransaction,
	]);

	// Close modal on success
	useEffect(() => {
		if (isTransactionSuccess) {
			console.log(`${config.type}: Transaction successful, closing modal`);
			setHasAutoProceeded(false);
			onClose();
		}
	}, [isTransactionSuccess, onClose, config.type]);

	// Reset auto-proceed flag on modal open
	useEffect(() => {
		if (isOpen) {
			setHasAutoProceeded(false);
		}
	}, [isOpen]);

	// Reset auto-proceed flag on amount change (for repay)
	useEffect(() => {
		if (config.type === 'repay') {
			setHasAutoProceeded(false);
		}
	}, [amount, config.type]);

	// Error handling
	useEffect(() => {
		if (isApproveError) {
			console.log(`${config.type}: Approval transaction failed`);
			setHasAutoProceeded(false);
			alert('Token approval failed. Please try again.');
		}
	}, [isApproveError, config.type]);

	useEffect(() => {
		if (isTransactionError) {
			console.log(`${config.type}: Transaction failed`);
			setHasAutoProceeded(false);
			alert(`${config.type} transaction failed. Please try again.`);
		}
	}, [isTransactionError, config.type]);

	// Handlers
	const handleMaxClick = () => {
		if (maxAvailable > 0n && tokenDecimals) {
			const formatted = formatUnits(maxAvailable, tokenDecimals);
			const number = parseFloat(formatted);
			setAmount(number.toFixed(Math.min(8, tokenDecimals)));
		}
	};

	const handleApprove = () => {
		console.log(`${config.type}: handleApprove called`, {
			underlyingTokenAddress,
			isValidAmount,
			marketAddress,
			amountInWei: amountInWei.toString(),
		});

		if (!underlyingTokenAddress || !isValidAmount) {
			console.log(`${config.type}: handleApprove early return - missing requirements`);
			return;
		}

		const approvalAmount = useMaxApproval ? maxUint256 : amountInWei;
		console.log(`${config.type}: Calling approve transaction with amount:`, approvalAmount.toString());
		approve({
			address: underlyingTokenAddress,
			abi: ERC20_ABI,
			functionName: 'approve',
			args: [marketAddress, approvalAmount],
		});
	};

	const handleSubmit = () => {
		console.log(`${config.type}: handleSubmit called`, {
			isValidAmount,
			needsApproval,
			amountInWei: amountInWei.toString(),
		});

		if (!isValidAmount) {
			console.log(`${config.type}: handleSubmit early return - invalid amount`);
			return;
		}

		if (needsApproval) {
			console.log(`${config.type}: Triggering approval first`);
			handleApprove();
		} else {
			console.log(`${config.type}: Proceeding with main transaction`);
			executeMainTransaction();
		}
	};

	const handleApprovalSettingChange = (checked: boolean) => {
		setUseMaxApproval(checked);
		localStorage.setItem('useMaxApproval', JSON.stringify(checked));
	};

	// Computed state objects
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
		cleanSymbol: '', // Will be set by the component
	};

	const balanceData: BalanceData = {
		walletBalance: balance?.value,
		balance,
		availableToBorrow: config.type === 'borrow' ? maxAvailable : undefined,
		accountLiquidity,
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
		// State
		amount,
		setAmount,
		transactionState,
		tokenData,
		balanceData,
		approvalSettings,
		
		// Computed values
		amountInWei,
		maxAvailable,
		isValidAmount,
		
		// Handlers
		handleMaxClick,
		handleSubmit,
		handleApprovalSettingChange,
	};
};