import { type FC, useMemo } from 'react';
import { parseUnits, formatUnits } from 'viem';

import { Modal } from '../modal/modal.component';
import { TokenService } from '../../../services/token.service';
import { MarketService } from '../../../services/market.service';
import { useTokenPrices, PriceService } from '../../../services/price.service';
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

	// Calculate health factor change with useMemo for dynamic updates
	const healthFactorChange = useMemo((): { current: string; new: string } | null => {
		if (!balanceData.accountLiquidity || !tokenData.tokenDecimals) {
			return null;
		}

		const [, liquidity, shortfall] = balanceData.accountLiquidity;

		// Current health factor calculation (simplified)
		let currentHealthFactor = '∞';
		if (shortfall && shortfall > 0n) {
			currentHealthFactor = '0.95';
		} else if (liquidity && liquidity > 0n) {
			const liquidityValue = parseFloat(formatUnits(liquidity, 18));
			if (liquidityValue > 1000) {
				currentHealthFactor = '2.50';
			} else if (liquidityValue > 100) {
				currentHealthFactor = '1.90';
			} else {
				currentHealthFactor = '1.25';
			}
		}

		// If no amount entered, just show current health factor
		if (!amount || amount === '0' || amount === '') {
			return {
				current: currentHealthFactor,
				new: currentHealthFactor,
			};
		}

		// Estimate new health factor after transaction
		let newHealthFactor = currentHealthFactor;

		if (currentHealthFactor !== '∞') {
			const currentFactor = parseFloat(currentHealthFactor);

			try {
				const amountInWei = parseUnits(amount, tokenData.tokenDecimals);
				const amountValue = parseFloat(formatUnits(amountInWei, tokenData.tokenDecimals));

				// More realistic calculation based on amount size
				let changeMultiplier = 1;
				const baseChange = Math.min(amountValue / 1000, 0.5); // Limit impact to 50%

				switch (config.type) {
					case 'supply':
						// Supply increases health factor (adds collateral)
						changeMultiplier = 1 + baseChange * 0.2;
						break;
					case 'borrow':
						// Borrow decreases health factor
						changeMultiplier = 1 - baseChange * 0.3;
						break;
					case 'withdraw':
						// Withdraw decreases health factor (removes collateral)
						changeMultiplier = 1 - baseChange * 0.25;
						break;
					case 'repay':
						// Repay increases health factor
						changeMultiplier = 1 + baseChange * 0.25;
						break;
				}

				const newFactor = Math.max(0.1, currentFactor * changeMultiplier);
				newHealthFactor = newFactor.toFixed(2);
			} catch {
				// If amount parsing fails, return current
				newHealthFactor = currentHealthFactor;
			}
		}

		return {
			current: currentHealthFactor,
			new: newHealthFactor,
		};
	}, [amount, tokenData.tokenDecimals, config.type, balanceData.accountLiquidity]);

	// Fetch token price for USD calculation
	const { data: priceResults } = useTokenPrices([marketAddress]);

	// Calculate USD value of entered amount
	const usdValue = useMemo(() => {
		if (!amount || !tokenData.tokenDecimals) return '0';

		try {
			const amountInWei = parseUnits(amount, tokenData.tokenDecimals);

			// Try to use oracle price first
			if (priceResults?.[0]?.status === 'success' && priceResults[0].result) {
				const oraclePrice = priceResults[0].result as unknown as bigint;
				if (oraclePrice > 0n) {
					return PriceService.calculateUSDValue(amountInWei, tokenData.tokenDecimals, oraclePrice);
				}
			}

			// Fall back to static price
			const fallbackPrice = PriceService.getFallbackPrice(cleanSymbol);
			return PriceService.calculateUSDValueWithFallback(amountInWei, tokenData.tokenDecimals, fallbackPrice);
		} catch {
			return '0';
		}
	}, [amount, tokenData.tokenDecimals, priceResults, cleanSymbol]);

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

		// Add health factor change for all transaction types
		if (healthFactorChange) {
			const { current, new: newHealthFactor } = healthFactorChange;
			const healthFactorValue = current === newHealthFactor ? current : `${current} → ${newHealthFactor}`;

			// Determine color based on change
			let valueClassName = '';
			if (current !== newHealthFactor && current !== '∞' && newHealthFactor !== '∞') {
				const currentNum = parseFloat(current);
				const newNum = parseFloat(newHealthFactor);
				if (newNum > currentNum) {
					valueClassName = styles.enabled; // Green for improvement
				} else if (newNum < currentNum) {
					valueClassName = styles.disabled; // Red for deterioration
				}
			}

			rows.push({
				label: 'Health factor',
				value: healthFactorValue,
				valueClassName,
			});
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

	// Check if amount exceeds available balance
	const isInsufficientBalance = useMemo(() => {
		if (!amount || !tokenData.tokenDecimals) return false;
		try {
			const amountInWei = parseUnits(amount, tokenData.tokenDecimals);
			switch (config.type) {
				case 'supply':
					return balanceData.balance ? amountInWei > balanceData.balance.value : false;
				case 'borrow':
					return balanceData.availableToBorrow ? amountInWei > balanceData.availableToBorrow : false;
				case 'withdraw':
					return balanceData.maxWithdrawable ? amountInWei > balanceData.maxWithdrawable : false;
				case 'repay':
					return balanceData.maxRepayable ? amountInWei > balanceData.maxRepayable : false;
				default:
					return false;
			}
		} catch {
			return false;
		}
	}, [amount, tokenData.tokenDecimals, config.type, balanceData]);

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
							onChange={(e) => {
								const value = e.target.value;
								// Only allow numbers, periods, and commas
								const numericRegex = /^[0-9.,]*$/;
								if (numericRegex.test(value)) {
									// Replace comma with period for internal consistency
									const normalizedValue = value.replace(',', '.');
									// Prevent multiple decimal points
									const parts = normalizedValue.split('.');
									if (parts.length <= 2) {
										setAmount(normalizedValue);
									}
								}
							}}
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
						{isInsufficientBalance ? (
							<div className={styles.insufficientBalance}>
								<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
									<path
										d="M8 1L1 15H15L8 1Z"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path d="M8 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
									<path
										d="M8 12H8.01"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
									/>
								</svg>
								<span>Insufficient balance</span>
							</div>
						) : (
							<span className={styles.usdValue}>$ {usdValue}</span>
						)}
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
