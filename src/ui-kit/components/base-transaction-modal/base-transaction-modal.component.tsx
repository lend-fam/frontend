import { type FC, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { parseUnits, formatUnits, type Address } from 'viem';

import { Modal } from '../modal/modal.component';
import { TokenService } from '../../../services/token.service';
import { MarketService } from '../../../services/market.service';
import { useTokenPrices, PriceService } from '../../../services/price.service';
import { HealthFactorService, type PositionData } from '../../../services/health-factor.service';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';
import { FlexContainer } from '../flex-container/flex-container.component';
import { Button } from '../button/button.component';
import { useTransactionFlow } from './use-transaction-flow.hook';
import { useUserSupplyPositions, useUserBorrowPositions } from '../../../hooks/use-user-positions.hook';
import { useMarketsCollateralFactors } from '../../../hooks/use-market-data.hook';
import { useTokenMetadata } from '../../../hooks/use-token-metadata.hook';
import { useAccount } from 'wagmi';
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
		handleCleanDust,
		isDustAmount,
	} = useTransactionFlow({
		marketAddress,
		config,
		isOpen,
		onClose,
		availableLiquidity,
		onSuccess,
	});

	const { address } = useAccount();
	const { data: supplyPositions } = useUserSupplyPositions(address);
	const { data: borrowPositions } = useUserBorrowPositions(address);
	const { data: collateralFactors } = useMarketsCollateralFactors();
	const { data: priceResults } = useTokenPrices([marketAddress]);
	const { data: tokenMetadata } = useTokenMetadata([marketAddress]);

	const metadata = tokenMetadata?.[marketAddress];
	const cleanSymbol = TokenService.formatMarketName(undefined, undefined, marketAddress, metadata);

	const sliderRef = useRef<HTMLInputElement>(null);
	const isDraggingRef = useRef(false);
	const [sliderValue, setSliderValue] = useState(0);

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

	const calculatePercentage = useCallback(
		(inputAmount: string): number => {
			if (!inputAmount || !tokenData.tokenDecimals || inputAmount === '0' || inputAmount === '') {
				return 0;
			}

			try {
				const pureNumber = parseFloat(inputAmount.replace(/,/g, ''));
				const actualAmount =
					!isNaN(pureNumber) && isFinite(pureNumber) ? pureNumber : parseCompactNotation(inputAmount);

				if (actualAmount === 0) return 0;

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
		},
		[tokenData.tokenDecimals, getMaxBalance, parseCompactNotation],
	);

	const formatFloatingPoint = useCallback((value: number): string => {
		if (value === 0) return '0.00000000';

		return value.toFixed(8);
	}, []);

	const calculateAmountFromPercentage = useCallback(
		(percentage: number): string => {
			if (!tokenData.tokenDecimals) return '0';

			const maxBalance = getMaxBalance();
			if (maxBalance === 0n) return '0';

			const targetAmount = (maxBalance * BigInt(percentage)) / 100n;
			const pureNumber = formatUnits(targetAmount, tokenData.tokenDecimals);
			const numericValue = parseFloat(pureNumber);

			return formatFloatingPoint(numericValue);
		},
		[tokenData.tokenDecimals, getMaxBalance, formatFloatingPoint],
	);

	useEffect(() => {
		if (!isDraggingRef.current) {
			const newPercentage = calculatePercentage(amount);
			setSliderValue(newPercentage);

			if (sliderRef.current) {
				sliderRef.current.value = newPercentage.toString();
				sliderRef.current.style.setProperty('--fill-percent', `${newPercentage}%`);
			}
		}
	}, [amount, calculatePercentage]);

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

	useEffect(() => {
		const handleGlobalMouseUp = () => {
			isDraggingRef.current = false;
		};

		const handleGlobalTouchEnd = () => {
			isDraggingRef.current = false;
		};

		document.addEventListener('mouseup', handleGlobalMouseUp);
		document.addEventListener('touchend', handleGlobalTouchEnd);

		return () => {
			document.removeEventListener('mouseup', handleGlobalMouseUp);
			document.removeEventListener('touchend', handleGlobalTouchEnd);
		};
	}, []);

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

	const healthFactorChange = useMemo((): { current: string; new: string } | null => {
		if (
			!balanceData.accountLiquidity ||
			!tokenData.tokenDecimals ||
			!supplyPositions ||
			!borrowPositions ||
			!collateralFactors ||
			!priceResults
		) {
			return null;
		}

		const positions: PositionData[] = [];

		let transactionMarketPrice = 1;
		if (priceResults?.[0]?.status === 'success' && priceResults[0].result) {
			const result = priceResults[0].result;
			const oraclePrice = typeof result === 'bigint' ? result : BigInt(String(result));
			transactionMarketPrice = parseFloat(formatUnits(oraclePrice, 18));
		} else {
			transactionMarketPrice = PriceService.getFallbackPrice(cleanSymbol);
		}

		Object.entries(supplyPositions).forEach(([marketAddr, position]) => {
			const borrowBalance = borrowPositions[marketAddr as Address]?.balance || 0n;
			if (position.balance > 0n || borrowBalance > 0n) {
				const collateralFactor = collateralFactors[marketAddr as Address] || 0;
				const priceUSD =
					marketAddr === marketAddress ? transactionMarketPrice : PriceService.getFallbackPrice(marketAddr);

				positions.push({
					marketAddress: marketAddr as Address,
					suppliedBalance: position.balance,
					borrowedBalance: borrowBalance,
					collateralFactor,
					priceUSD,
					decimals: tokenData.tokenDecimals || 18,
				});
			}
		});

		Object.entries(borrowPositions).forEach(([marketAddr, position]) => {
			if (position.balance > 0n && !supplyPositions[marketAddr as Address]) {
				const collateralFactor = collateralFactors[marketAddr as Address] || 0;
				const priceUSD =
					marketAddr === marketAddress ? transactionMarketPrice : PriceService.getFallbackPrice(marketAddr);

				positions.push({
					marketAddress: marketAddr as Address,
					suppliedBalance: 0n,
					borrowedBalance: position.balance,
					collateralFactor,
					priceUSD,
					decimals: tokenData.tokenDecimals || 18,
				});
			}
		});

		if (!positions.find((p) => p.marketAddress === marketAddress)) {
			const collateralFactor = collateralFactors[marketAddress] || 0;
			positions.push({
				marketAddress,
				suppliedBalance: 0n,
				borrowedBalance: 0n,
				collateralFactor,
				priceUSD: transactionMarketPrice,
				decimals: tokenData.tokenDecimals || 18,
			});
		}

		const currentHealthFactor = HealthFactorService.calculateHealthFactor(positions, balanceData.accountLiquidity);

		if (!amount || amount === '0' || amount === '') {
			return {
				current: currentHealthFactor.healthFactor,
				new: currentHealthFactor.healthFactor,
			};
		}

		try {
			const transactionAmount = parseUnits(amount, tokenData.tokenDecimals);
			const healthFactorChangeResult = HealthFactorService.calculateHealthFactorChange(
				positions,
				config.type,
				transactionAmount,
				marketAddress,
				balanceData.accountLiquidity,
			);

			return healthFactorChangeResult;
		} catch {
			return {
				current: currentHealthFactor.healthFactor,
				new: currentHealthFactor.healthFactor,
			};
		}
	}, [
		amount,
		tokenData.tokenDecimals,
		config.type,
		balanceData.accountLiquidity,
		supplyPositions,
		borrowPositions,
		collateralFactors,
		priceResults,
		marketAddress,
		cleanSymbol,
	]);

	const usdValue = useMemo(() => {
		if (!amount || !tokenData.tokenDecimals) return '0';

		try {
			const amountInWei = parseUnits(amount, tokenData.tokenDecimals);

			if (priceResults?.[0]?.status === 'success' && priceResults[0].result) {
				const oraclePrice = priceResults[0].result as unknown as bigint;
				if (oraclePrice > 0n) {
					return PriceService.calculateUSDValue(amountInWei, tokenData.tokenDecimals, oraclePrice);
				}
			}

			const fallbackPrice = PriceService.getFallbackPrice(cleanSymbol);
			return PriceService.calculateUSDValueWithFallback(amountInWei, tokenData.tokenDecimals, fallbackPrice);
		} catch {
			return '0';
		}
	}, [amount, tokenData.tokenDecimals, priceResults, cleanSymbol]);

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

		if (healthFactorChange) {
			const { current, new: newHealthFactor } = healthFactorChange;
			const healthFactorValue = current === newHealthFactor ? current : `${current} → ${newHealthFactor}`;

			let valueClassName = '';
			if (current !== newHealthFactor && current !== '∞' && newHealthFactor !== '∞') {
				const currentNum = parseFloat(current);
				const newNum = parseFloat(newHealthFactor);
				valueClassName = newNum > currentNum ? styles.enabled : newNum < currentNum ? styles.disabled : '';
			}

			rows.push({
				label: 'Health factor',
				value: healthFactorValue,
				valueClassName,
			});
		}

		return rows;
	};

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

	const isInsufficientBalance = useMemo(() => {
		if (!amount || !tokenData.tokenDecimals) return false;
		try {
			const pureNumber = parseFloat(amount.replace(/,/g, ''));
			const actualAmount = !isNaN(pureNumber) && isFinite(pureNumber) ? pureNumber : parseCompactNotation(amount);

			if (actualAmount === 0) return false;

			const amountInWei = parseUnits(actualAmount.toString(), tokenData.tokenDecimals);
			const maxBalance = getMaxBalance();

			if (maxBalance === 0n) return false;

			const tolerance = maxBalance / 1000n;
			return amountInWei > maxBalance + tolerance;
		} catch {
			return false;
		}
	}, [amount, tokenData.tokenDecimals, getMaxBalance, parseCompactNotation]);

	const isMaxRepay = useMemo(() => {
		if (config.type !== 'repay' || !amount || !balanceData.borrowBalance || !tokenData.tokenDecimals) {
			return false;
		}

		try {
			const amountInWei = parseUnits(amount, tokenData.tokenDecimals);
			return amountInWei >= balanceData.borrowBalance;
		} catch {
			return false;
		}
	}, [config.type, amount, balanceData.borrowBalance, tokenData.tokenDecimals]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`${config.type.charAt(0).toUpperCase() + config.type.slice(1)} ${cleanSymbol}`}>
			<FlexContainer variant="column" className={styles.container}>
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
								if (/^[0-9.,KMBkmb]*$/.test(value)) {
									const normalizedValue = value
										.replace(',', '.')
										.replace(/[kmb]/g, (match) => match.toUpperCase());
									const beforeSuffix = normalizedValue.replace(/[KMB]$/, '');
									const suffix = normalizedValue.match(/[KMB]$/)?.[0] || '';

									if (beforeSuffix.split('.').length <= 2) {
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

					<div className={styles.sliderContainer}>
						<input
							ref={sliderRef}
							type="range"
							min="0"
							max="100"
							defaultValue={sliderValue}
							style={
								{
									'--fill-percent': `${sliderValue}%`,
								} as React.CSSProperties
							}
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
							onChange={(e) => {
								const percentage = parseInt(e.target.value);
								setSliderValue(percentage);

								if (sliderRef.current) {
									sliderRef.current.style.setProperty('--fill-percent', `${percentage}%`);
								}

								const newAmount = calculateAmountFromPercentage(percentage);
								setAmount(newAmount);
							}}
							className={styles.percentageSlider}
						/>
						<div className={styles.sliderLabels}>
							{[0, 25, 50, 75, 100].map((percentage) => (
								<button
									key={percentage}
									type="button"
									onClick={() => {
										setSliderValue(percentage);
										if (sliderRef.current) {
											sliderRef.current.value = percentage.toString();
											sliderRef.current.style.setProperty('--fill-percent', `${percentage}%`);
										}
										const newAmount =
											percentage === 0 ? '0' : calculateAmountFromPercentage(percentage);
										setAmount(newAmount);
									}}
									className={styles.percentageLabel}>
									{percentage}%
								</button>
							))}
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
							<FlexContainer variant="alignCenter" className={styles.buttonGroup}>
								<Button
									variant="outline"
									size="small"
									onClick={handleMaxClick}
								>
									MAX
								</Button>
								{config.type === 'repay' && isDustAmount && (
									<Button
										variant="outline"
										size="small"
										onClick={handleCleanDust}
										className={styles.cleanDustButton}
									>
										CLEAN DUST
									</Button>
								)}
							</FlexContainer>
						</div>
					</div>
				</div>

				{config.requiresApproval && (
					<div className={styles.section}>
						<h3 className={styles.sectionTitle}>Approval Settings</h3>
						<div className={styles.approvalContainer}>
							<div className={styles.approvalOption}>
								<label className={styles.approvalLabel}>
									<input
										type="checkbox"
										checked={approvalSettings.useMaxApproval || isMaxRepay}
										onChange={(e) => handleApprovalSettingChange(e.target.checked)}
										disabled={isMaxRepay}
										className={styles.approvalCheckbox}
									/>
									<span className={styles.approvalText}>
										<span className={styles.approvalTextMain}>
											Unlimited approval (gas efficient for future transactions)
										</span>
										<span className={styles.requiredIndicator}>
											<span
												className={`${styles.requiredText} ${isMaxRepay ? styles.visible : styles.hidden}`}>
												Required
											</span>
										</span>
									</span>
								</label>
								<div className={styles.approvalDescription}>
									{isMaxRepay
										? 'Required for max repay to handle interest accrual'
										: approvalSettings.useMaxApproval
											? 'Approve unlimited amount for future transactions'
											: `Approve only ${amount || '0'} ${cleanSymbol} for this transaction`}
								</div>
							</div>
						</div>
					</div>
				)}

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

				<Button
					variant="submit"
					size="large"
					onClick={handleSubmit}
					disabled={!isValidAmount || transactionState.isProcessing}
					loading={transactionState.isProcessing}
					fullWidth
				>
					{getSubmitButtonText()}
				</Button>
			</FlexContainer>
		</Modal>
	);
};

export const BaseTransactionModal = typedMemo(BaseTransactionModalComponent);
