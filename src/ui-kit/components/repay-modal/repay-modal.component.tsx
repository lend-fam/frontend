import { type FC, useState, useMemo } from 'react';
import type { Address } from 'viem';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

import { Modal } from '../modal/modal.component';
import { CTOKEN_ABI } from '../../../contracts';
import { TokenService } from '../../../services/token.service';

import css from './repay-modal.module.css';

interface RepayModalProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	tokenSymbol: string;
	borrowAPY: string;
}

export const RepayModal: FC<RepayModalProps> = ({
	isOpen,
	onClose,
	marketAddress,
	// tokenSymbol,
	borrowAPY,
}) => {
	const [amount, setAmount] = useState('');
	const { address } = useAccount();

	// Get wallet balance for repayment
	const { data: balance } = useBalance({
		address,
		// TODO: Get underlying token address from market contract
	});

	// Get user's borrow balance
	const { data: borrowBalance } = useReadContract({
		address: marketAddress,
		abi: CTOKEN_ABI,
		functionName: 'borrowBalanceStored',
		args: address ? [address] : undefined,
		query: { enabled: !!address },
	});

	const { writeContract: repay, data: repayHash, isPending: isRepayPending } = useWriteContract();
	const { isLoading: isRepayConfirming } = useWaitForTransactionReceipt({ hash: repayHash });

	const isProcessing = isRepayPending || isRepayConfirming;

	const maxRepayable = useMemo(() => {
		if (!balance || !borrowBalance) return 0n;
		// Can only repay up to the smaller of wallet balance or borrowed amount
		return balance.value < borrowBalance ? balance.value : borrowBalance;
	}, [balance, borrowBalance]);

	const amountInWei = useMemo(() => {
		if (!amount || isNaN(Number(amount))) return 0n;
		try {
			return parseUnits(amount, 18);
		} catch {
			return 0n;
		}
	}, [amount]);

	const isValidAmount = useMemo(() => {
		if (!amount || !borrowBalance) return false;
		return amountInWei > 0n && amountInWei <= maxRepayable;
	}, [amount, amountInWei, maxRepayable, borrowBalance]);

	const handleMaxClick = () => {
		if (maxRepayable > 0n) {
			setAmount(formatUnits(maxRepayable, 18));
		}
	};

	const handleRepay = () => {
		if (!isValidAmount) return;

		repay({
			address: marketAddress,
			abi: CTOKEN_ABI,
			functionName: 'repayBorrow',
			args: [amountInWei],
		});
	};

	const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress);
	const cleanSymbol = displayName.replace('Market ', '').split(' ')[0];

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={`Repay ${cleanSymbol}`}>
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
							<span>Wallet balance {balance ? formatUnits(balance.value, balance.decimals) : '0'}</span>
							<button type="button" onClick={handleMaxClick} className={css.maxButton}>
								MAX
							</button>
						</div>
					</div>
				</div>

				{/* Transaction Overview */}
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
								{borrowBalance ? formatUnits(borrowBalance, 18) : '0'} {cleanSymbol}
							</span>
						</div>
						<div className={css.overviewRow}>
							<span className={css.overviewLabel}>Remaining debt</span>
							<span className={css.overviewValue}>
								{amount && borrowBalance
									? formatUnits(borrowBalance - amountInWei, 18)
									: borrowBalance
										? formatUnits(borrowBalance, 18)
										: '0'}{' '}
								{cleanSymbol}
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
					onClick={handleRepay}
					disabled={!isValidAmount || isProcessing}
					className={css.submitButton}>
					{isProcessing ? 'Processing...' : !amount ? 'Enter an amount' : 'Repay'}
				</button>
			</div>
		</Modal>
	);
};
