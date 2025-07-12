import { type FC, useState, useMemo } from 'react';
import type { Address } from 'viem';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

import { Modal } from '../modal/modal.component';
import { CTOKEN_ABI, ERC20_ABI } from '../../../contracts';
import { TokenService } from '../../../services/token.service';

import css from './withdraw-modal.module.css';

interface WithdrawModalProps {
	isOpen: boolean;
	onClose: () => void;
	marketAddress: Address;
	tokenSymbol: string;
	supplyAPY: string;
}

export const WithdrawModal: FC<WithdrawModalProps> = ({
	isOpen,
	onClose,
	marketAddress,
	// tokenSymbol,
	supplyAPY,
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

	// Get user's cToken balance (supplied amount)
	const { data: cTokenBalance } = useReadContract({
		address: marketAddress,
		abi: CTOKEN_ABI,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
		query: { enabled: !!address },
	});

	// Get exchange rate to convert cTokens to underlying tokens
	const { data: exchangeRate } = useReadContract({
		address: marketAddress,
		abi: CTOKEN_ABI,
		functionName: 'exchangeRateStored',
	});

	const { writeContract: withdraw, data: withdrawHash, isPending: isWithdrawPending } = useWriteContract();
	const { isLoading: isWithdrawConfirming } = useWaitForTransactionReceipt({ hash: withdrawHash });

	const isProcessing = isWithdrawPending || isWithdrawConfirming;

	const maxWithdrawable = useMemo(() => {
		if (!cTokenBalance || !exchangeRate || !tokenDecimals) return 0n;
		// Convert cTokens to underlying tokens using exchange rate
		return (cTokenBalance * exchangeRate) / parseUnits('1', 18);
	}, [cTokenBalance, exchangeRate, tokenDecimals]);

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
		return amountInWei > 0n && amountInWei <= maxWithdrawable;
	}, [amount, amountInWei, maxWithdrawable]);

	const handleMaxClick = () => {
		if (maxWithdrawable > 0n && tokenDecimals) {
			setAmount(formatUnits(maxWithdrawable, tokenDecimals));
		}
	};

	const handleWithdraw = () => {
		if (!isValidAmount) return;

		// Convert underlying amount to cTokens for redemption
		const cTokensToRedeem = exchangeRate && tokenDecimals ? (amountInWei * parseUnits('1', 18)) / exchangeRate : 0n;

		withdraw({
			address: marketAddress,
			abi: CTOKEN_ABI,
			functionName: 'redeem',
			args: [cTokensToRedeem],
		});
	};

	const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress);
	const cleanSymbol = displayName.replace('Market ', '').split(' ')[0];

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={`Withdraw ${cleanSymbol}`}>
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
							<span>Supplied {tokenDecimals ? formatUnits(maxWithdrawable, tokenDecimals) : '0'}</span>
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
							<span className={css.overviewLabel}>Supply APY</span>
							<span className={css.overviewValue}>{supplyAPY}</span>
						</div>
						<div className={css.overviewRow}>
							<span className={css.overviewLabel}>Remaining supplied</span>
							<span className={css.overviewValue}>
								{amount && tokenDecimals
									? formatUnits(maxWithdrawable - amountInWei, tokenDecimals)
									: tokenDecimals
										? formatUnits(maxWithdrawable, tokenDecimals)
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
					onClick={handleWithdraw}
					disabled={!isValidAmount || isProcessing}
					className={css.submitButton}>
					{isProcessing ? 'Processing...' : !amount ? 'Enter an amount' : 'Withdraw'}
				</button>
			</div>
		</Modal>
	);
};
