import { type FC, useState, useMemo, useEffect, useCallback } from 'react';
import type { Address } from 'viem';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits, formatUnits, maxUint256 } from 'viem';

import { Modal } from '../modal/modal.component';
import { CTOKEN_ABI, ERC20_ABI } from '../../../contracts';
import { TokenService } from '../../../services/token.service';
import { MarketService } from '../../../services/market.service';
import { useApprovalTransaction } from '../../../hooks/use-transaction-tracker.hook';
import { useTransactionContext } from '../../../hooks/use-transaction-context.hook';

import css from '../supply-modal/supply-modal.module.css';

interface SupplyModalEnhancedProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	supplyAPY: string;
	isCollateralEnabled: boolean;
}

export const SupplyModalEnhanced: FC<SupplyModalEnhancedProps> = ({
	isOpen,
	onClose,
	marketAddress,
	supplyAPY,
	isCollateralEnabled,
}) => {
	const [amount, setAmount] = useState('');
	const [useMaxApproval, setUseMaxApproval] = useState(() => {
		const saved = localStorage.getItem('useMaxApproval');
		return saved !== null ? JSON.parse(saved) : true;
	});
	const { address } = useAccount();
	const queryClient = useQueryClient();
	const { addTransaction } = useTransactionContext();

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

	const { data: currentAllowance } = useReadContract({
		address: underlyingTokenAddress,
		abi: ERC20_ABI,
		functionName: 'allowance',
		args: address && underlyingTokenAddress ? [address, marketAddress] : undefined,
		query: { enabled: !!address && !!underlyingTokenAddress },
	});

	const amountInWei = useMemo(() => {
		if (!amount || isNaN(Number(amount)) || !tokenDecimals) return 0n;
		try {
			return parseUnits(amount, tokenDecimals);
		} catch {
			return 0n;
		}
	}, [amount, tokenDecimals]);

	const needsApproval = useMemo(() => {
		if (!amountInWei || amountInWei === 0n) return false;
		const allowance = currentAllowance ?? 0n;
		return allowance < amountInWei;
	}, [currentAllowance, amountInWei]);

	const isValidAmount = useMemo(() => {
		if (!amount || !balance) return false;
		return amountInWei > 0n && amountInWei <= balance.value;
	}, [amount, balance, amountInWei]);

	const tracker = useApprovalTransaction({
		tokenAddress: underlyingTokenAddress,
		spenderAddress: marketAddress,
		mainContractAddress: marketAddress,
		onComplete: () => {
			// Invalidate relevant queries to refresh data
			queryClient.invalidateQueries({ queryKey: ['balance'] });
			queryClient.invalidateQueries({ queryKey: ['readContract'] });
			onClose();
		},
		onError: (error) => {
			console.error('Supply transaction failed:', error);
			alert(`Transaction failed: ${error.message}`);
		},
	});

	const resetTracker = useCallback(() => {
		tracker.reset();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tracker.reset]);

	useEffect(() => {
		if (isOpen) {
			resetTracker();
		}
	}, [isOpen, resetTracker]);

	const handleMaxClick = () => {
		if (balance && tokenDecimals) {
			const formatted = formatUnits(balance.value, tokenDecimals);
			const number = parseFloat(formatted);
			setAmount(number.toFixed(Math.min(8, tokenDecimals)));
		}
	};

	const handleSupply = () => {
		if (!isValidAmount || !underlyingTokenAddress) return;

		// Initialize transaction steps
		tracker.initializeSteps(needsApproval, 'Supply');

		if (needsApproval) {
			// Start with approval transaction
			const approvalAmount = useMaxApproval ? maxUint256 : amountInWei;
			tracker.executeTransaction({
				address: underlyingTokenAddress,
				abi: ERC20_ABI,
				functionName: 'approve',
				args: [marketAddress, approvalAmount],
			});

			// Add to global transaction tracking
			if (tracker.currentStep?.hash) {
				addTransaction({
					hash: tracker.currentStep.hash,
					type: 'approval',
					tokenAddress: underlyingTokenAddress,
					marketAddress,
					amount: useMaxApproval ? 'unlimited' : amount,
					status: 'pending',
				});
			}
		} else {
			// Execute supply directly
			tracker.executeTransaction({
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'mint',
				args: [amountInWei],
			});

			// Add to global transaction tracking
			if (tracker.currentStep?.hash) {
				addTransaction({
					hash: tracker.currentStep.hash,
					type: 'supply',
					marketAddress,
					tokenAddress: underlyingTokenAddress,
					amount,
					status: 'pending',
				});
			}
		}
	};

	// Auto-proceed to supply after approval
	useEffect(() => {
		if (tracker.steps.length === 2 && tracker.steps[0].state === 'success' && tracker.currentStep?.id === 'main') {
			tracker.executeTransaction({
				address: marketAddress,
				abi: CTOKEN_ABI,
				functionName: 'mint',
				args: [amountInWei],
			});

			// Add supply transaction to tracking
			if (tracker.currentStep?.hash) {
				addTransaction({
					hash: tracker.currentStep.hash,
					type: 'supply',
					marketAddress,
					tokenAddress: underlyingTokenAddress!,
					amount,
					status: 'pending',
				});
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		tracker.steps,
		tracker.currentStep,
		tracker.executeTransaction,
		amountInWei,
		marketAddress,
		underlyingTokenAddress,
		amount,
		addTransaction,
	]);

	const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress);
	const cleanSymbol = displayName.replace('Market ', '').split(' ')[0];

	const getButtonText = () => {
		if (!amount) return 'Enter an amount';
		if (tracker.isProcessing) {
			if (tracker.currentStep?.state === 'pending') return 'Confirm in wallet...';
			if (tracker.currentStep?.state === 'confirming') return 'Processing...';
			return 'Processing...';
		}
		return needsApproval ? 'Approve & Supply' : 'Supply';
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={`Supply ${cleanSymbol}`}>
			<div className={css.container}>
				{/* Transaction Progress */}
				{tracker.steps.length > 0 && (
					<div className={css.section}>
						<h3 className={css.sectionTitle}>Transaction Progress</h3>
						<div className={css.progressContainer}>
							{tracker.steps.map((step, index) => (
								<div key={step.id} className={css.progressStep}>
									<div className={`${css.stepIndicator} ${css[step.state]}`}>
										{step.state === 'success' ? '✓' : index + 1}
									</div>
									<div className={css.stepInfo}>
										<div className={css.stepTitle}>{step.title}</div>
										<div className={css.stepDescription}>{step.description}</div>
										{step.state === 'error' && <div className={css.stepError}>{step.error}</div>}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

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
							disabled={tracker.isProcessing}
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
							<button
								type="button"
								onClick={handleMaxClick}
								className={css.maxButton}
								disabled={tracker.isProcessing}>
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
									disabled={tracker.isProcessing}
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
					onClick={handleSupply}
					disabled={!isValidAmount || tracker.isProcessing}
					className={css.submitButton}>
					{getButtonText()}
				</button>
			</div>
		</Modal>
	);
};
