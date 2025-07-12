import { type FC, useState, useMemo, useEffect } from 'react';
import type { Address } from 'viem';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

import { Modal } from '../modal/modal.component';
import { CTOKEN_ABI, ERC20_ABI } from '../../../contracts';
import { TokenService } from '../../../services/token.service';
import { MarketService } from '../../../services/market.service';
import { useAccountLiquidity } from '../../../hooks/use-markets.hook';

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

	// Get user's account liquidity (borrowing power)
	const { data: accountLiquidity } = useAccountLiquidity(address);

	const { writeContract: borrow, data: borrowHash, isPending: isBorrowPending } = useWriteContract();
	const {
		isLoading: isBorrowConfirming,
		isSuccess: isBorrowSuccess,
		isError: isBorrowError,
	} = useWaitForTransactionReceipt({ hash: borrowHash });

	const isProcessing = isBorrowPending || isBorrowConfirming;

	// Calculate actual available borrowing amount for this user
	const availableToBorrow = useMemo(() => {
		if (!accountLiquidity || !tokenDecimals) return 0n;

		// accountLiquidity returns [error, liquidity, shortfall]
		const [, liquidity] = accountLiquidity as [bigint, bigint, bigint];

		if (!liquidity || liquidity <= 0n) return 0n;

		// Convert user's liquidity (in USD scaled by 1e18) to token amount
		// This is a simplified calculation - in reality you'd need price oracle data
		// For now, assume 1:1 USD ratio as approximation
		const userBorrowingPower = liquidity;

		// Take minimum of user's borrowing power and market's available cash
		return userBorrowingPower < availableLiquidity ? userBorrowingPower : availableLiquidity;
	}, [accountLiquidity, availableLiquidity, tokenDecimals]);

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
		return amountInWei > 0n && amountInWei <= availableToBorrow;
	}, [amount, amountInWei, availableToBorrow]);

	const handleMaxClick = () => {
		if (availableToBorrow > 0n && tokenDecimals) {
			// Use a precise amount for input, but limit decimal places to avoid scientific notation
			const formatted = formatUnits(availableToBorrow, tokenDecimals);
			const number = parseFloat(formatted);
			setAmount(number.toFixed(Math.min(8, tokenDecimals)));
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

	// Close modal after successful borrow transaction
	useEffect(() => {
		if (isBorrowSuccess) {
			console.log('Borrow: Transaction successful, closing modal');
			onClose();
		}
	}, [isBorrowSuccess, onClose]);

	// Show alert for failed borrow transaction
	useEffect(() => {
		if (isBorrowError) {
			console.log('Borrow: Borrow transaction failed');
			alert('Borrow transaction failed. Please try again.');
		}
	}, [isBorrowError]);

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
								Available{' '}
								{tokenDecimals
									? MarketService.formatTokenBalance(availableToBorrow, tokenDecimals)
									: '0'}
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
