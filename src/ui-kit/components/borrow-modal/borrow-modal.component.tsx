import { type FC, useState, useMemo } from 'react';
import type { Address } from 'viem';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

import { Modal } from '../modal/modal.component';
import { CTOKEN_ABI, ERC20_ABI } from '../../../contracts';
import { TokenService } from '../../../services/token.service';

import css from './borrow-modal.module.css';

interface BorrowModalProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	tokenSymbol: string;
	borrowAPY: string;
	availableLiquidity: bigint;
}

export const BorrowModal: FC<BorrowModalProps> = ({
	isOpen,
	onClose,
	marketAddress,
	// tokenSymbol,
	borrowAPY,
	availableLiquidity,
}) => {
	const [amount, setAmount] = useState('');
	// const { address } = useAccount();

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

	const { writeContract: borrow, data: borrowHash, isPending: isBorrowPending } = useWriteContract();
	const { isLoading: isBorrowConfirming } = useWaitForTransactionReceipt({ hash: borrowHash });

	const isProcessing = isBorrowPending || isBorrowConfirming;

	const amountInWei = useMemo(() => {
		if (!amount || isNaN(Number(amount)) || !tokenDecimals) return 0n;
		try {
			return parseUnits(amount, tokenDecimals);
		} catch {
			return 0n;
		}
	}, [amount, tokenDecimals]);

	const isValidAmount = useMemo(() => {
		if (!amount) return false;
		return amountInWei > 0n && amountInWei <= availableLiquidity;
	}, [amount, amountInWei, availableLiquidity]);

	const handleMaxClick = () => {
		if (availableLiquidity > 0n && tokenDecimals) {
			setAmount(formatUnits(availableLiquidity, tokenDecimals));
		}
	};

	const handleBorrow = () => {
		if (!isValidAmount) return;

		borrow({
			address: marketAddress,
			abi: CTOKEN_ABI,
			functionName: 'borrow',
			args: [amountInWei],
		});
	};

	const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress);
	const cleanSymbol = displayName.replace('Market ', '').split(' ')[0];

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={`Borrow ${cleanSymbol}`}>
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
								Available {tokenDecimals ? formatUnits(availableLiquidity, tokenDecimals) : '0'}
							</span>
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
					onClick={handleBorrow}
					disabled={!isValidAmount || isProcessing}
					className={css.submitButton}>
					{isProcessing ? 'Processing...' : !amount ? 'Enter an amount' : 'Borrow'}
				</button>
			</div>
		</Modal>
	);
};
