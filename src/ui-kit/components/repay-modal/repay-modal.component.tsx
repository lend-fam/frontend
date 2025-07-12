import { type FC, useState, useMemo, useEffect } from 'react';
import type { Address } from 'viem';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, maxUint256 } from 'viem';

import { Modal } from '../modal/modal.component';
import { CTOKEN_ABI, ERC20_ABI } from '../../../contracts';
import { TokenService } from '../../../services/token.service';
import { MarketService } from '../../../services/market.service';

import css from './repay-modal.module.css';

interface RepayModalProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	borrowAPY: string;
}

export const RepayModal: FC<RepayModalProps> = ({ isOpen, onClose, marketAddress, borrowAPY }) => {
	const [amount, setAmount] = useState('');
	const [useMaxApproval, setUseMaxApproval] = useState(() => {
		const saved = localStorage.getItem('useMaxApproval');
		return saved !== null ? JSON.parse(saved) : true;
	});
	const [hasAutoProceeded, setHasAutoProceeded] = useState(false);
	const { address } = useAccount();

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
		query: { enabled: !!underlyingTokenAddress },
	});

	const { data: borrowBalance } = useReadContract({
		address: marketAddress,
		abi: CTOKEN_ABI,
		functionName: 'borrowBalanceStored',
		args: address ? [address] : undefined,
		query: { enabled: !!address },
	});

	const { data: currentAllowance } = useReadContract({
		address: underlyingTokenAddress,
		abi: ERC20_ABI,
		functionName: 'allowance',
		args: address && underlyingTokenAddress ? [address, marketAddress] : undefined,
		query: { enabled: !!address && !!underlyingTokenAddress },
	});

	const { writeContract: approve, data: approveHash, isPending: isApprovePending } = useWriteContract();
	const {
		isLoading: isApproveConfirming,
		isSuccess: isApproveSuccess,
		isError: isApproveError,
	} = useWaitForTransactionReceipt({ hash: approveHash });

	const { writeContract: repay, data: repayHash, isPending: isRepayPending } = useWriteContract();
	const {
		isLoading: isRepayConfirming,
		isSuccess: isRepaySuccess,
		isError: isRepayError,
	} = useWaitForTransactionReceipt({ hash: repayHash });

	const isProcessing = isApprovePending || isApproveConfirming || isRepayPending || isRepayConfirming;

	const maxRepayable = useMemo(() => {
		if (!balance || !borrowBalance) return 0n;
		return balance.value < borrowBalance ? balance.value : borrowBalance;
	}, [balance, borrowBalance]);

	const amountInWei = useMemo(() => {
		if (!amount || isNaN(Number(amount)) || !tokenDecimals) return 0n;
		try {
			return parseUnits(amount, tokenDecimals);
		} catch {
			return 0n;
		}
	}, [amount, tokenDecimals]);

	const needsApproval = useMemo(() => {
		if (!amountInWei || amountInWei === 0n) {
			console.log('Repay: No approval needed - no amount:', amountInWei);
			return false;
		}
		const allowance = currentAllowance ?? 0n;
		const needs = allowance < amountInWei;

		console.log(
			'Repay: Needs approval?',
			needs,
			'allowance:',
			allowance.toString(),
			'amount:',
			amountInWei.toString(),
		);
		return needs;
	}, [currentAllowance, amountInWei]);

	const isValidAmount = useMemo(() => {
		if (!amount || !borrowBalance) return false;
		return amountInWei > 0n && amountInWei <= maxRepayable;
	}, [amount, amountInWei, maxRepayable, borrowBalance]);

	useEffect(() => {
		console.log('Repay: Auto-proceed effect triggered', {
			isOpen,
			isApproveSuccess,
			isRepayPending,
			isRepayConfirming,
			isValidAmount,
			hasAutoProceeded,
		});

		if (isOpen && isApproveSuccess && !isRepayPending && !isRepayConfirming && isValidAmount && !hasAutoProceeded) {
			console.log('Repay: Auto-proceeding with repay transaction after approval success');
			setHasAutoProceeded(true);
			repay({
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'repayBorrow',
				args: [amountInWei],
			});
		}
	}, [
		isOpen,
		isApproveSuccess,
		isRepayPending,
		isRepayConfirming,
		isValidAmount,
		hasAutoProceeded,
		repay,
		marketAddress,
		amountInWei,
	]);

	useEffect(() => {
		if (isRepaySuccess) {
			console.log('Repay: Transaction successful, closing modal');
			setHasAutoProceeded(false);
			onClose();
		}
	}, [isRepaySuccess, onClose]);

	useEffect(() => {
		if (isOpen) {
			setHasAutoProceeded(false);
		}
	}, [isOpen]);

	useEffect(() => {
		setHasAutoProceeded(false);
	}, [amount]);

	useEffect(() => {
		if (isApproveError) {
			console.log('Repay: Approval transaction failed');
			setHasAutoProceeded(false);
			alert('Token approval failed. Please try again.');
		}
	}, [isApproveError]);

	useEffect(() => {
		if (isRepayError) {
			console.log('Repay: Repay transaction failed');
			setHasAutoProceeded(false);
			alert('Repay transaction failed. Please try again.');
		}
	}, [isRepayError]);

	const handleMaxClick = () => {
		if (maxRepayable > 0n && tokenDecimals) {
			const formatted = formatUnits(maxRepayable, tokenDecimals);
			const number = parseFloat(formatted);
			setAmount(number.toFixed(Math.min(8, tokenDecimals)));
		}
	};

	const handleApprove = () => {
		console.log('Repay: handleApprove called', {
			underlyingTokenAddress,
			isValidAmount,
			marketAddress,
			amountInWei: amountInWei.toString(),
		});

		if (!underlyingTokenAddress || !isValidAmount) {
			console.log('Repay: handleApprove early return - missing requirements');
			return;
		}

		const approvalAmount = useMaxApproval ? maxUint256 : amountInWei;
		console.log('Repay: Calling approve transaction with amount:', approvalAmount.toString());
		approve({
			address: underlyingTokenAddress,
			abi: ERC20_ABI,
			functionName: 'approve',
			args: [marketAddress, approvalAmount],
		});
	};

	const handleRepay = () => {
		console.log('Repay: handleRepay called', {
			isValidAmount,
			needsApproval,
			amountInWei: amountInWei.toString(),
		});

		if (!isValidAmount) {
			console.log('Repay: handleRepay early return - invalid amount');
			return;
		}

		if (needsApproval) {
			console.log('Repay: Triggering approval first');
			handleApprove();
		} else {
			console.log('Repay: Proceeding with repay transaction');
			repay({
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'repayBorrow',
				args: [amountInWei],
			});
		}
	};

	const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress);
	const cleanSymbol = displayName.replace('Market ', '').split(' ')[0];

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={`Repay ${cleanSymbol}`}>
			<div className={css.container}>
				<div className={css.section}>
					<div className={css.sectionHeader}>
						<label className={css.label}>Amount</label>
						<div className={css.info}>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
								<circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" />
								<path
									d="M8 12V8M8 4H8.01"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
						</div>
					</div>

					<div className={css.inputContainer}>
						<input
							type="text"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="0.00"
							className={css.amountInput}
						/>
						<div className={css.tokenInfo}>
							<div className={css.tokenIcon}>
								<div className={css.tokenSymbol}>{cleanSymbol.charAt(0)}</div>
							</div>
							<span className={css.tokenName}>{cleanSymbol}</span>
						</div>
					</div>

					<div className={css.balanceInfo}>
						<span className={css.usdValue}>$ 0</span>
						<div className={css.walletBalance}>
							<span>
								Wallet balance{' '}
								{balance && tokenDecimals
									? MarketService.formatTokenBalance(balance.value, tokenDecimals)
									: '0'}
							</span>
							<button type="button" onClick={handleMaxClick} className={css.maxButton}>
								MAX
							</button>
						</div>
					</div>
				</div>

				<div className={css.section}>
					<h3 className={css.sectionTitle}>Approval Settings</h3>
					<div className={css.approvalContainer}>
						<div className={css.approvalOption}>
							<label className={css.approvalLabel}>
								<input
									type="checkbox"
									checked={useMaxApproval}
									onChange={(e) => {
										const checked = e.target.checked;
										setUseMaxApproval(checked);
										localStorage.setItem('useMaxApproval', JSON.stringify(checked));
									}}
									className={css.approvalCheckbox}
								/>
								<span className={css.approvalText}>
									Unlimited approval (gas efficient for future transactions)
								</span>
							</label>
							<div className={css.approvalDescription}>
								{useMaxApproval
									? 'Approve unlimited amount for future transactions'
									: `Approve only ${amount || '0'} ${cleanSymbol} for this transaction`}
							</div>
						</div>
					</div>
				</div>

				<div className={css.section}>
					<h3 className={css.sectionTitle}>Transaction overview</h3>
					<div className={css.overviewContainer}>
						<div className={css.overviewRow}>
							<span className={css.overviewLabel}>Borrow APY</span>
							<span className={css.overviewValue}>{borrowAPY}</span>
						</div>
						<div className={css.overviewRow}>
							<span className={css.overviewLabel}>Borrowed amount</span>
							<span className={css.overviewValue}>
								{borrowBalance && tokenDecimals
									? MarketService.formatTokenBalance(borrowBalance, tokenDecimals)
									: '0'}{' '}
								{cleanSymbol}
							</span>
						</div>
						<div className={css.overviewRow}>
							<span className={css.overviewLabel}>Remaining debt</span>
							<span className={css.overviewValue}>
								{amount && borrowBalance && tokenDecimals
									? MarketService.formatTokenBalance(borrowBalance - amountInWei, tokenDecimals)
									: borrowBalance && tokenDecimals
										? MarketService.formatTokenBalance(borrowBalance, tokenDecimals)
										: '0'}{' '}
								{cleanSymbol}
							</span>
						</div>
					</div>
				</div>

				<div className={css.gasSection}>
					<div className={css.gasIcon}>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path
								d="M2 6H14L12 4M2 6L4 4M2 6V12C2 12.5523 2.44772 13 3 13H13C13.5523 13 14 12.5523 14 12V6"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
					<span className={css.gasText}>-</span>
				</div>

				<button
					type="button"
					onClick={handleRepay}
					disabled={!isValidAmount || isProcessing}
					className={css.submitButton}>
					{isProcessing
						? isApprovePending || isApproveConfirming
							? 'Approving...'
							: 'Processing...'
						: !amount
							? 'Enter an amount'
							: needsApproval
								? 'Approve & Repay'
								: 'Repay'}
				</button>
			</div>
		</Modal>
	);
};
