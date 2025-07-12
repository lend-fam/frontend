import { type FC, useState, useMemo } from 'react';
import type { Address } from 'viem';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

import { Modal } from '../modal/modal.component';
import { CTOKEN_ABI } from '../../../contracts';
import { TokenService } from '../../../services/token.service';
// import { MarketService } from '../../../services/market.service';

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
	const { address } = useAccount();

	// Get wallet balance
	const { data: balance } = useBalance({
		address,
		// TODO: Get underlying token address from market contract
	});

	const { writeContract: supply, data: supplyHash, isPending: isSupplyPending } = useWriteContract();
	const { isLoading: isSupplyConfirming } = useWaitForTransactionReceipt({ hash: supplyHash });

	const isProcessing = isSupplyPending || isSupplyConfirming;

	const amountInWei = useMemo(() => {
		if (!amount || isNaN(Number(amount))) return 0n;
		try {
			return parseUnits(amount, 18);
		} catch {
			return 0n;
		}
	}, [amount]);

	const isValidAmount = useMemo(() => {
		if (!amount || !balance) return false;
		return amountInWei > 0n && amountInWei <= balance.value;
	}, [amount, balance, amountInWei]);

	const handleMaxClick = () => {
		if (balance) {
			setAmount(formatUnits(balance.value, balance.decimals));
		}
	};

	const handleSupply = () => {
		if (!isValidAmount) return;

		supply({
			address: marketAddress,
			abi: CTOKEN_ABI,
			functionName: 'mint',
			args: [amountInWei],
		});
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
					{isProcessing ? 'Processing...' : !amount ? 'Enter an amount' : 'Supply'}
				</button>
			</div>
		</Modal>
	);
};
