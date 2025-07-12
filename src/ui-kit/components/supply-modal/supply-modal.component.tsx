import { type FC, useState, useMemo, useEffect } from 'react';
import type { Address } from 'viem';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, maxUint256 } from 'viem';

import { Modal } from '../modal/modal.component';
import { CTOKEN_ABI, ERC20_ABI } from '../../../contracts';
import { TokenService } from '../../../services/token.service';
import { MarketService } from '../../../services/market.service';

import css from './supply-modal.module.css';

interface SupplyModalProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	tokenSymbol: string;
	supplyAPY: string;
	isCollateralEnabled: boolean;
}

export const SupplyModal: FC<SupplyModalProps> = ({
	isOpen,
	onClose,
	marketAddress,
	// tokenSymbol,
	supplyAPY,
	isCollateralEnabled,
}) => {
	const [amount, setAmount] = useState('');
	const [useMaxApproval, setUseMaxApproval] = useState(() => {
		const saved = localStorage.getItem('useMaxApproval');
		return saved !== null ? JSON.parse(saved) : true;
	});
	const [hasAutoProceeded, setHasAutoProceeded] = useState(false);
	const { address } = useAccount();

	// Get underlying token address
	const { data: underlyingTokenAddress } = useReadContract({
		address: marketAddress,
		abi: CTOKEN_ABI,
		functionName: 'underlying',
	});

	// Get token decimals
	const { data: tokenDecimals } = useReadContract({
		address: underlyingTokenAddress,
		abi: ERC20_ABI,
		functionName: 'decimals',
		query: { enabled: !!underlyingTokenAddress },
	});

	// Get wallet balance of underlying token
	const { data: balance } = useBalance({
		address,
		token: underlyingTokenAddress,
		query: { enabled: !!underlyingTokenAddress },
	});

	// Get current allowance using ERC20_ABI
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

	const { writeContract: supply, data: supplyHash, isPending: isSupplyPending } = useWriteContract();
	const {
		isLoading: isSupplyConfirming,
		isSuccess: isSupplySuccess,
		isError: isSupplyError,
	} = useWaitForTransactionReceipt({ hash: supplyHash });

	const isProcessing = isApprovePending || isApproveConfirming || isSupplyPending || isSupplyConfirming;

	const amountInWei = useMemo(() => {
		if (!amount || isNaN(Number(amount)) || !tokenDecimals) return 0n;
		try {
			return parseUnits(amount, tokenDecimals);
		} catch {
			return 0n;
		}
	}, [amount, tokenDecimals]);

	const needsApproval = useMemo(() => {
		// Check if we have a valid amount to work with
		if (!amountInWei || amountInWei === 0n) {
			console.log('Supply: No approval needed - no amount:', amountInWei);
			return false;
		}

		// If allowance is undefined/null, treat as 0 (needs approval)
		const allowance = currentAllowance ?? 0n;
		const needs = allowance < amountInWei;

		console.log(
			'Supply: Needs approval?',
			needs,
			'allowance:',
			allowance.toString(),
			'amount:',
			amountInWei.toString(),
		);
		return needs;
	}, [currentAllowance, amountInWei]);

	const isValidAmount = useMemo(() => {
		if (!amount || !balance) return false;
		return amountInWei > 0n && amountInWei <= balance.value;
	}, [amount, balance, amountInWei]);

	// Auto-proceed with supply after approval succeeds
	useEffect(() => {
		console.log('Supply: Auto-proceed effect triggered', {
			isApproveSuccess,
			isSupplyPending,
			isSupplyConfirming,
			isValidAmount,
			hasAutoProceeded,
		});

		if (isApproveSuccess && !isSupplyPending && !isSupplyConfirming && isValidAmount && !hasAutoProceeded) {
			console.log('Supply: Auto-proceeding with supply transaction after approval success');
			setHasAutoProceeded(true);
			supply({
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'mint',
				args: [amountInWei],
			});
		}
	}, [isApproveSuccess, isSupplyPending, isSupplyConfirming, isValidAmount, hasAutoProceeded, supply, marketAddress, amountInWei]);

	// Close modal after successful supply transaction
	useEffect(() => {
		if (isSupplySuccess) {
			console.log('Supply: Transaction successful, closing modal');
			setHasAutoProceeded(false); // Reset for next time
			onClose();
		}
	}, [isSupplySuccess, onClose]);

	// Reset proceed flag when modal opens
	useEffect(() => {
		if (isOpen) {
			setHasAutoProceeded(false);
		}
	}, [isOpen]);

	// Show alert for failed approval transaction
	useEffect(() => {
		if (isApproveError) {
			console.log('Supply: Approval transaction failed');
			alert('Token approval failed. Please try again.');
		}
	}, [isApproveError]);

	// Show alert for failed supply transaction
	useEffect(() => {
		if (isSupplyError) {
			console.log('Supply: Supply transaction failed');
			alert('Supply transaction failed. Please try again.');
		}
	}, [isSupplyError]);

	const handleMaxClick = () => {
		if (balance && tokenDecimals) {
			// Use a precise amount for input, but limit decimal places to avoid scientific notation
			const formatted = formatUnits(balance.value, tokenDecimals);
			const number = parseFloat(formatted);
			setAmount(number.toFixed(Math.min(8, tokenDecimals)));
		}
	};

	const handleApprove = () => {
		console.log('Supply: handleApprove called', {
			underlyingTokenAddress,
			isValidAmount,
			marketAddress,
			amountInWei: amountInWei.toString(),
		});

		if (!underlyingTokenAddress || !isValidAmount) {
			console.log('Supply: handleApprove early return - missing requirements');
			return;
		}

		const approvalAmount = useMaxApproval ? maxUint256 : amountInWei;
		console.log('Supply: Calling approve transaction with amount:', approvalAmount.toString());
		approve({
			address: underlyingTokenAddress,
			abi: ERC20_ABI,
			functionName: 'approve',
			args: [marketAddress, approvalAmount],
		});
	};

	const handleSupply = () => {
		console.log('Supply: handleSupply called', {
			isValidAmount,
			needsApproval,
			amountInWei: amountInWei.toString(),
		});

		if (!isValidAmount) {
			console.log('Supply: handleSupply early return - invalid amount');
			return;
		}

		// Check if we need approval
		if (needsApproval) {
			console.log('Supply: Triggering approval first');
			handleApprove();
		} else {
			// Proceed with supply if approval is sufficient
			console.log('Supply: Proceeding with supply transaction');
			supply({
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'mint',
				args: [amountInWei],
			});
		}
	};

	const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress);
	const cleanSymbol = displayName.replace('Market ', '').split(' ')[0];

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={`Supply ${cleanSymbol}`}>
			<div className={css.container}>
				{/* Amount Section */}
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

				{/* Approval Settings */}
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

				{/* Transaction Overview */}
				<div className={css.section}>
					<h3 className={css.sectionTitle}>Transaction overview</h3>
					<div className={css.overviewContainer}>
						<div className={css.overviewRow}>
							<span className={css.overviewLabel}>Supply APY</span>
							<span className={css.overviewValue}>{supplyAPY}</span>
						</div>
						<div className={css.overviewRow}>
							<span className={css.overviewLabel}>Collateralization</span>
							<span
								className={`${css.overviewValue} ${isCollateralEnabled ? css.enabled : css.disabled}`}>
								{isCollateralEnabled ? 'Enabled' : 'Disabled'}
							</span>
						</div>
					</div>
				</div>

				{/* Gas Fee Indicator */}
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

				{/* Submit Button */}
				<button
					type="button"
					onClick={handleSupply}
					disabled={!isValidAmount || isProcessing}
					className={css.submitButton}>
					{isProcessing
						? isApprovePending || isApproveConfirming
							? 'Approving...'
							: 'Processing...'
						: !amount
							? 'Enter an amount'
							: needsApproval
								? 'Approve & Supply'
								: 'Supply'}
				</button>
			</div>
		</Modal>
	);
};
