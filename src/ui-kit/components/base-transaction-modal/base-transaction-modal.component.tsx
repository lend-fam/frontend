import { type FC } from 'react';
import { parseUnits } from 'viem';

import { Modal } from '../modal/modal.component';
import { TokenService } from '../../../services/token.service';
import { MarketService } from '../../../services/market.service';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';
import { useTransactionFlow } from './use-transaction-flow.hook';
import type { BaseTransactionModalProps, TransactionOverviewRow } from './transaction.types';

import css from './base-transaction-modal.module.css';

const BaseTransactionModalComponent: FC<BaseTransactionModalProps> = ({
	isOpen,
	onClose,
	marketAddress,
	config,
	supplyAPY,
	borrowAPY,
	isCollateralEnabled,
	availableLiquidity,
	onSuccess,
	theme,
}) => {
	const styles = useTheme(css, theme);
	const {
		amount,
		setAmount,
		transactionState,
		tokenData,
		balanceData,
		approvalSettings,
		isValidAmount,
		handleMaxClick,
		handleSubmit,
		handleApprovalSettingChange,
	} = useTransactionFlow({
		marketAddress,
		config,
		isOpen,
		onClose,
		availableLiquidity,
		onSuccess,
	});

	const displayName = TokenService.formatMarketName(undefined, undefined, marketAddress);
	const cleanSymbol = displayName.replace('Market ', '').split(' ')[0];

	// Get balance label and value based on transaction type
	const getBalanceInfo = () => {
		switch (config.type) {
			case 'supply':
				return {
					label: 'Wallet balance',
					value:
						balanceData.balance && tokenData.tokenDecimals
							? MarketService.formatTokenBalance(balanceData.balance.value, tokenData.tokenDecimals)
							: '0',
				};
			case 'borrow':
				return {
					label: 'Available',
					value:
						balanceData.availableToBorrow && tokenData.tokenDecimals
							? MarketService.formatTokenBalance(balanceData.availableToBorrow, tokenData.tokenDecimals)
							: '0',
				};
			case 'withdraw':
				return {
					label: 'Supplied',
					value:
						balanceData.maxWithdrawable && tokenData.tokenDecimals
							? MarketService.formatTokenBalance(balanceData.maxWithdrawable, tokenData.tokenDecimals)
							: '0',
				};
			case 'repay':
				return {
					label: 'Wallet balance',
					value:
						balanceData.balance && tokenData.tokenDecimals
							? MarketService.formatTokenBalance(balanceData.balance.value, tokenData.tokenDecimals)
							: '0',
				};
			default:
				return { label: 'Balance', value: '0' };
		}
	};

	// Generate transaction overview rows based on type
	const getOverviewRows = (): TransactionOverviewRow[] => {
		const rows: TransactionOverviewRow[] = [];

		switch (config.type) {
			case 'supply':
				if (supplyAPY) {
					rows.push({ label: 'Supply APY', value: supplyAPY });
				}
				if (typeof isCollateralEnabled === 'boolean') {
					rows.push({
						label: 'Collateralization',
						value: isCollateralEnabled ? 'Enabled' : 'Disabled',
						valueClassName: isCollateralEnabled ? styles.enabled : styles.disabled,
					});
				}
				break;
			case 'borrow':
				if (borrowAPY) {
					rows.push({ label: 'Borrow APY', value: borrowAPY });
				}
				break;
			case 'withdraw':
				if (supplyAPY) {
					rows.push({ label: 'Supply APY', value: supplyAPY });
				}
				rows.push({
					label: 'Remaining supplied',
					value: `${
						amount && tokenData.tokenDecimals && balanceData.maxWithdrawable
							? MarketService.formatTokenBalance(
									balanceData.maxWithdrawable - parseUnits(amount, tokenData.tokenDecimals),
									tokenData.tokenDecimals,
								)
							: balanceData.maxWithdrawable && tokenData.tokenDecimals
								? MarketService.formatTokenBalance(balanceData.maxWithdrawable, tokenData.tokenDecimals)
								: '0'
					} ${cleanSymbol}`,
				});
				break;
			case 'repay':
				if (borrowAPY) {
					rows.push({ label: 'Borrow APY', value: borrowAPY });
				}
				rows.push({
					label: 'Borrowed amount',
					value: `${
						balanceData.borrowBalance && tokenData.tokenDecimals
							? MarketService.formatTokenBalance(balanceData.borrowBalance, tokenData.tokenDecimals)
							: '0'
					} ${cleanSymbol}`,
				});
				rows.push({
					label: 'Remaining debt',
					value: `${
						amount && balanceData.borrowBalance && tokenData.tokenDecimals
							? MarketService.formatTokenBalance(
									balanceData.borrowBalance - parseUnits(amount, tokenData.tokenDecimals),
									tokenData.tokenDecimals,
								)
							: balanceData.borrowBalance && tokenData.tokenDecimals
								? MarketService.formatTokenBalance(balanceData.borrowBalance, tokenData.tokenDecimals)
								: '0'
					} ${cleanSymbol}`,
				});
				break;
		}

		return rows;
	};

	// Get submit button text
	const getSubmitButtonText = () => {
		if (transactionState.isProcessing) {
			if (transactionState.isApprovePending || transactionState.isApproveConfirming) {
				return 'Approving...';
			}
			return 'Processing...';
		}

		if (!amount) {
			return 'Enter an amount';
		}

		if (transactionState.needsApproval) {
			return `Approve & ${config.type.charAt(0).toUpperCase() + config.type.slice(1)}`;
		}

		return config.type.charAt(0).toUpperCase() + config.type.slice(1);
	};

	const balanceInfo = getBalanceInfo();
	const overviewRows = getOverviewRows();

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`${config.type.charAt(0).toUpperCase() + config.type.slice(1)} ${cleanSymbol}`}>
			<div className={styles.container}>
				{/* Amount Section */}
				<div className={styles.section}>
					<div className={styles.sectionHeader}>
						<label className={styles.label}>Amount</label>
						<div className={styles.info}>
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

					<div className={styles.inputContainer}>
						<input
							type="text"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="0.00"
							className={styles.amountInput}
						/>
						<div className={styles.tokenInfo}>
							<div className={styles.tokenIcon}>
								<div className={styles.tokenSymbol}>{cleanSymbol.charAt(0)}</div>
							</div>
							<span className={styles.tokenName}>{cleanSymbol}</span>
						</div>
					</div>

					<div className={styles.balanceInfo}>
						<span className={styles.usdValue}>$ 0</span>
						<div className={styles.walletBalance}>
							<span>
								{balanceInfo.label} {balanceInfo.value}
							</span>
							<button type="button" onClick={handleMaxClick} className={styles.maxButton}>
								MAX
							</button>
						</div>
					</div>
				</div>

				{/* Approval Settings (only for transactions that require approval) */}
				{config.requiresApproval && (
					<div className={styles.section}>
						<h3 className={styles.sectionTitle}>Approval Settings</h3>
						<div className={styles.approvalContainer}>
							<div className={styles.approvalOption}>
								<label className={styles.approvalLabel}>
									<input
										type="checkbox"
										checked={approvalSettings.useMaxApproval}
										onChange={(e) => handleApprovalSettingChange(e.target.checked)}
										className={styles.approvalCheckbox}
									/>
									<span className={styles.approvalText}>
										Unlimited approval (gas efficient for future transactions)
									</span>
								</label>
								<div className={styles.approvalDescription}>
									{approvalSettings.useMaxApproval
										? 'Approve unlimited amount for future transactions'
										: `Approve only ${amount || '0'} ${cleanSymbol} for this transaction`}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Transaction Overview */}
				{overviewRows.length > 0 && (
					<div className={styles.section}>
						<h3 className={styles.sectionTitle}>Transaction overview</h3>
						<div className={styles.overviewContainer}>
							{overviewRows.map((row, index) => (
								<div key={index} className={styles.overviewRow}>
									<span className={styles.overviewLabel}>{row.label}</span>
									<span className={`${styles.overviewValue} ${row.valueClassName || ''}`}>
										{row.value}
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Gas Fee Indicator */}
				<div className={styles.gasSection}>
					<div className={styles.gasIcon}>
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
					<span className={styles.gasText}>-</span>
				</div>

				{/* Submit Button */}
				<button
					type="button"
					onClick={handleSubmit}
					disabled={!isValidAmount || transactionState.isProcessing}
					className={styles.submitButton}>
					{getSubmitButtonText()}
				</button>
			</div>
		</Modal>
	);
};

export const BaseTransactionModal = typedMemo(BaseTransactionModalComponent);
