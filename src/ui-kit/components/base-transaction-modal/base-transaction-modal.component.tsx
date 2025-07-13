import { type FC, useMemo, useState, useEffect, useRef, useCallback } from 'react';
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

	// Use useRef to avoid re-rendering during slider interaction
	const sliderRef = useRef<HTMLInputElement>(null);
	const isDraggingRef = useRef(false);
	const [sliderValue, setSliderValue] = useState(0);

	// Get max balance for current transaction type
	const getMaxBalance = useCallback(() => {
		switch (config.type) {
			case 'supply':
				return balanceData.balance?.value || 0n;
			case 'borrow':
				return balanceData.availableToBorrow || 0n;
			case 'withdraw':
				return balanceData.maxWithdrawable || 0n;
			case 'repay':
				return balanceData.maxRepayable || 0n;
			default:
				return 0n;
		}
	}, [config.type, balanceData]);

	// Parse compact notation (5.2K, 1.3M) to actual number
	const parseCompactNotation = useCallback((value: string): number => {
		if (!value || value === '') return 0;
		
		const cleanValue = value.replace(/,/g, '').trim();
		const lastChar = cleanValue.slice(-1).toLowerCase();
		const numericPart = cleanValue.slice(0, -1);
		
		let multiplier = 1;
		let numberStr = cleanValue;
		
		if (lastChar === 'k') {
			multiplier = 1000;
			numberStr = numericPart;
		} else if (lastChar === 'm') {
			multiplier = 1000000;
			numberStr = numericPart;
		} else if (lastChar === 'b') {
			multiplier = 1000000000;
			numberStr = numericPart;
		}
		
		const baseNumber = parseFloat(numberStr);
		if (isNaN(baseNumber)) return 0;
		
		return baseNumber * multiplier;
	}, []);

	// Calculate percentage from amount
	const calculatePercentage = useCallback((inputAmount: string): number => {
		if (!inputAmount || !tokenData.tokenDecimals || inputAmount === '0' || inputAmount === '') {
			return 0;
		}
		
		try {
			let actualAmount: number;
			
			// First try to parse as pure number
			const pureNumber = parseFloat(inputAmount.replace(/,/g, ''));
			if (!isNaN(pureNumber) && isFinite(pureNumber)) {
				actualAmount = pureNumber;
			} else {
				// Fall back to compact notation parsing (for when users type 5.2K)
				actualAmount = parseCompactNotation(inputAmount);
			}
			
			if (actualAmount === 0) return 0;
			
			// Convert to wei for comparison
			const amountInWei = parseUnits(actualAmount.toString(), tokenData.tokenDecimals);
			const maxBalance = getMaxBalance();
			
			if (maxBalance === 0n) return 0;
			
			const amountValue = parseFloat(formatUnits(amountInWei, tokenData.tokenDecimals));
			const maxValue = parseFloat(formatUnits(maxBalance, tokenData.tokenDecimals));
			
			if (maxValue === 0) return 0;
			const percentage = (amountValue / maxValue) * 100;
			return Math.min(100, Math.max(0, Math.round(percentage)));
		} catch {
			return 0;
		}
	}, [tokenData.tokenDecimals, getMaxBalance, parseCompactNotation]);

	// Format floating point numbers with exactly 8 decimal places
	const formatFloatingPoint = useCallback((value: number): string => {
		if (value === 0) return '0.00000000';
		
		// Always show exactly 8 decimal places
		return value.toFixed(8);
	}, []);

	// Calculate amount from percentage
	const calculateAmountFromPercentage = useCallback((percentage: number): string => {
		if (!tokenData.tokenDecimals) return '0';
		
		const maxBalance = getMaxBalance();
		if (maxBalance === 0n) return '0';
		
		const targetAmount = (maxBalance * BigInt(percentage)) / 100n;
		// Return floating point number format (5200.50, 123.456, etc.)
		const pureNumber = formatUnits(targetAmount, tokenData.tokenDecimals);
		const numericValue = parseFloat(pureNumber);
		
		return formatFloatingPoint(numericValue);
	}, [tokenData.tokenDecimals, getMaxBalance, formatFloatingPoint]);

	// Update slider when amount changes externally (typing, MAX button)
	useEffect(() => {
		if (!isDraggingRef.current) {
			const newPercentage = calculatePercentage(amount);
			setSliderValue(newPercentage);
			
			// Directly update DOM to ensure visual position updates
			if (sliderRef.current) {
				sliderRef.current.value = newPercentage.toString();
				// Update fill color
				sliderRef.current.style.setProperty('--fill-percent', `${newPercentage}%`);
			}
		}
	}, [amount, calculatePercentage]);

	// Reset when modal closes
	useEffect(() => {
		if (!isOpen) {
			isDraggingRef.current = false;
			setSliderValue(0);
			if (sliderRef.current) {
				sliderRef.current.value = '0';
				sliderRef.current.style.setProperty('--fill-percent', '0%');
			}
		}
	}, [isOpen]);

	// Global event listeners to handle drag end outside slider
	useEffect(() => {
		const handleGlobalMouseUp = () => {
			isDraggingRef.current = false;
		};

		const handleGlobalTouchEnd = () => {
			isDraggingRef.current = false;
		};

		// Add listeners
		document.addEventListener('mouseup', handleGlobalMouseUp);
		document.addEventListener('touchend', handleGlobalTouchEnd);

		return () => {
			// Cleanup
			document.removeEventListener('mouseup', handleGlobalMouseUp);
			document.removeEventListener('touchend', handleGlobalTouchEnd);
		};
	}, []);

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

	// Check if amount exceeds available balance with tolerance for rounding
	const isInsufficientBalance = useMemo(() => {
		if (!amount || !tokenData.tokenDecimals) return false;
		try {
			// Parse the amount, handling both pure numbers and compact notation
			let actualAmount: number;
			const pureNumber = parseFloat(amount.replace(/,/g, ''));
			if (!isNaN(pureNumber) && isFinite(pureNumber)) {
				actualAmount = pureNumber;
			} else {
				actualAmount = parseCompactNotation(amount);
			}
			
			if (actualAmount === 0) return false;
			
			const amountInWei = parseUnits(actualAmount.toString(), tokenData.tokenDecimals);
			
			let maxBalance: bigint;
			switch (config.type) {
				case 'supply':
					maxBalance = balanceData.balance?.value || 0n;
					break;
				case 'borrow':
					maxBalance = balanceData.availableToBorrow || 0n;
					break;
				case 'withdraw':
					maxBalance = balanceData.maxWithdrawable || 0n;
					break;
				case 'repay':
					maxBalance = balanceData.maxRepayable || 0n;
					break;
				default:
					return false;
			}
			
			if (maxBalance === 0n) return false;
			
			// Add tolerance for rounding errors (allow up to 0.1% difference)
			const tolerance = maxBalance / 1000n; // 0.1% tolerance
			const maxBalanceWithTolerance = maxBalance + tolerance;
			
			return amountInWei > maxBalanceWithTolerance;
		} catch {
			return false;
		}
	}, [amount, tokenData.tokenDecimals, config.type, balanceData, parseCompactNotation]);

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
								// Allow numbers, periods, commas, and K/M/B suffixes
								const numericRegex = /^[0-9.,KMBkmb]*$/;
								if (numericRegex.test(value)) {
									// Replace comma with period for internal consistency
									let normalizedValue = value.replace(',', '.');
									
									// Ensure K/M/B is only at the end and uppercase
									normalizedValue = normalizedValue.replace(/[kmb]/g, (match) => match.toUpperCase());
									
									// Prevent multiple decimal points
									const beforeSuffix = normalizedValue.replace(/[KMB]$/, '');
									const suffix = normalizedValue.match(/[KMB]$/)?.[0] || '';
									const parts = beforeSuffix.split('.');
									
									if (parts.length <= 2) {
										setAmount(beforeSuffix + suffix);
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

					{/* Percentage Slider */}
					<div className={styles.sliderContainer}>
						<input
							ref={sliderRef}
							type="range"
							min="0"
							max="100"
							defaultValue={sliderValue}
							style={{
								'--fill-percent': `${sliderValue}%`
							} as React.CSSProperties}
							onMouseDown={() => {
								isDraggingRef.current = true;
							}}
							onMouseUp={() => {
								isDraggingRef.current = false;
							}}
							onTouchStart={() => {
								isDraggingRef.current = true;
							}}
							onTouchEnd={() => {
								isDraggingRef.current = false;
							}}
							onInput={(e) => {
								// Use onInput for immediate feedback during drag
								const percentage = parseInt(e.currentTarget.value);
								setSliderValue(percentage);
								
								// Update CSS custom property for fill color
								if (sliderRef.current) {
									sliderRef.current.style.setProperty('--fill-percent', `${percentage}%`);
								}
								
								// Update amount immediately during drag
								const newAmount = calculateAmountFromPercentage(percentage);
								setAmount(newAmount);
							}}
							onChange={(e) => {
								// Backup handler for when onInput isn't supported
								const percentage = parseInt(e.target.value);
								setSliderValue(percentage);
								
								// Update CSS custom property for fill color
								if (sliderRef.current) {
									sliderRef.current.style.setProperty('--fill-percent', `${percentage}%`);
								}
								
								const newAmount = calculateAmountFromPercentage(percentage);
								setAmount(newAmount);
							}}
							className={styles.percentageSlider}
						/>
						<div className={styles.sliderLabels}>
							<button
								type="button"
								onClick={() => {
									setSliderValue(0);
									if (sliderRef.current) {
										sliderRef.current.value = '0';
										sliderRef.current.style.setProperty('--fill-percent', '0%');
									}
									setAmount('0');
								}}
								className={styles.percentageLabel}
							>
								0%
							</button>
							<button
								type="button"
								onClick={() => {
									setSliderValue(25);
									if (sliderRef.current) {
										sliderRef.current.value = '25';
										sliderRef.current.style.setProperty('--fill-percent', '25%');
									}
									const newAmount = calculateAmountFromPercentage(25);
									setAmount(newAmount);
								}}
								className={styles.percentageLabel}
							>
								25%
							</button>
							<button
								type="button"
								onClick={() => {
									setSliderValue(50);
									if (sliderRef.current) {
										sliderRef.current.value = '50';
										sliderRef.current.style.setProperty('--fill-percent', '50%');
									}
									const newAmount = calculateAmountFromPercentage(50);
									setAmount(newAmount);
								}}
								className={styles.percentageLabel}
							>
								50%
							</button>
							<button
								type="button"
								onClick={() => {
									setSliderValue(75);
									if (sliderRef.current) {
										sliderRef.current.value = '75';
										sliderRef.current.style.setProperty('--fill-percent', '75%');
									}
									const newAmount = calculateAmountFromPercentage(75);
									setAmount(newAmount);
								}}
								className={styles.percentageLabel}
							>
								75%
							</button>
							<button
								type="button"
								onClick={() => {
									setSliderValue(100);
									if (sliderRef.current) {
										sliderRef.current.value = '100';
										sliderRef.current.style.setProperty('--fill-percent', '100%');
									}
									const newAmount = calculateAmountFromPercentage(100);
									setAmount(newAmount);
								}}
								className={styles.percentageLabel}
							>
								100%
							</button>
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
