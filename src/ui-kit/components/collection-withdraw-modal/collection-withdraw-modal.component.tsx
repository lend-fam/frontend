import { type FC, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { parseUnits, formatUnits, type Address } from 'viem';

import { Modal } from '../modal/modal.component';
import { CollectionModalHeader } from '../collection-modal-header/collection-modal-header.component';
import { MarketService } from '../../../services/market.service';
import { useTokenPrices, PriceService } from '../../../services/price.service';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';
import { FlexContainer } from '../flex-container/flex-container.component';
import { Button } from '../button/button.component';
import { useCollectionTransactionFlow } from '../../../hooks/use-collection-transaction-flow.hook';
import { useVaultTokenData } from '../../../hooks/use-vault-token-data.hook';
import { useCollectionId } from '../../../hooks/use-collection-id.hook';
// useAccount is used by the transaction flow hook
import type { CollectionDetailData } from '../../../ui/collection-detail-page/collection-detail-page.component';

import css from './collection-withdraw-modal.module.css';

export interface CollectionWithdrawModalProps {
	isOpen: boolean;
	onClose: () => void;
	vaultAddress: Address;
	collectionData: CollectionDetailData;
	onSuccess?: () => void;
	theme?: Record<string, string>;
}

const CollectionWithdrawModalComponent: FC<CollectionWithdrawModalProps> = ({
	isOpen,
	onClose,
	vaultAddress,
	collectionData,
	onSuccess,
	theme,
}) => {
	const styles = useTheme(css, theme);
	// Address is used by the transaction flow hook

	// Get vault token data for conversion rates and metadata
	const { data: vaultTokenData } = useVaultTokenData(vaultAddress);

	// Get collection ID from collection address
	const collectionId = useCollectionId(collectionData.collectionAddress);

	// Transaction flow hook (only when we have collection ID)
	const { amount, setAmount, transactionState, tokenData, balanceData, isValidAmount, handleMaxClick, handleSubmit } =
		useCollectionTransactionFlow({
			vaultAddress,
			config: {
				type: 'withdraw',
				collectionId: collectionId || 0n, // Use 0 as fallback if undefined
				requiresApproval: false, // Withdrawals don't require approval
			},
			vaultTokenData: vaultTokenData || undefined,
			isOpen: isOpen && !!collectionId, // Only open when we have collection ID
			onClose,
			onSuccess,
		});

	const { data: priceResults } = useTokenPrices(
		vaultTokenData?.underlyingAssetAddress ? [vaultTokenData.underlyingAssetAddress] : [],
	);

	const cleanSymbol = tokenData.cleanSymbol || 'Unknown';
	const tokenDecimals = tokenData.tokenDecimals || 18;

	const sliderRef = useRef<HTMLInputElement>(null);
	const isDraggingRef = useRef(false);
	const [sliderValue, setSliderValue] = useState(0);

	const getMaxBalance = useCallback(() => {
		return balanceData.maxWithdrawable || 0n;
	}, [balanceData.maxWithdrawable]);

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
			if (!inputAmount || inputAmount === '0' || inputAmount === '') {
				return 0;
			}

			try {
				const pureNumber = parseFloat(inputAmount.replace(/,/g, ''));
				const actualAmount =
					!isNaN(pureNumber) && isFinite(pureNumber) ? pureNumber : parseCompactNotation(inputAmount);

				if (actualAmount === 0) return 0;

				const amountInWei = parseUnits(actualAmount.toString(), tokenDecimals);
				const maxBalance = getMaxBalance();

				if (maxBalance === 0n) return 0;

				const amountValue = parseFloat(formatUnits(amountInWei, tokenDecimals));
				const maxValue = parseFloat(formatUnits(maxBalance, tokenDecimals));

				if (maxValue === 0) return 0;
				const percentage = (amountValue / maxValue) * 100;
				return Math.min(100, Math.max(0, Math.round(percentage)));
			} catch {
				return 0;
			}
		},
		[tokenDecimals, getMaxBalance, parseCompactNotation],
	);

	const formatFloatingPoint = useCallback((value: number): string => {
		if (value === 0) return '0.00000000';
		return value.toFixed(8);
	}, []);

	const calculateAmountFromPercentage = useCallback(
		(percentage: number): string => {
			const maxBalance = getMaxBalance();
			if (maxBalance === 0n) return '0';

			const targetAmount = (maxBalance * BigInt(percentage)) / 100n;
			const pureNumber = formatUnits(targetAmount, tokenDecimals);
			const numericValue = parseFloat(pureNumber);

			return formatFloatingPoint(numericValue);
		},
		[getMaxBalance, formatFloatingPoint, tokenDecimals],
	);

	// Slider synchronization
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

	// USD value calculation
	const usdValue = useMemo(() => {
		if (!amount) return '0';

		try {
			const amountInWei = parseUnits(amount, tokenDecimals);

			if (priceResults?.[0]?.status === 'success' && priceResults[0].result) {
				const oraclePrice = priceResults[0].result as unknown as bigint;
				if (oraclePrice > 0n) {
					return PriceService.calculateUSDValue(amountInWei, tokenDecimals, oraclePrice);
				}
			}

			const fallbackPrice = PriceService.getFallbackPrice(cleanSymbol);
			return PriceService.calculateUSDValueWithFallback(amountInWei, tokenDecimals, fallbackPrice);
		} catch {
			return '0';
		}
	}, [amount, tokenDecimals, priceResults, cleanSymbol]);

	// Calculate remaining balance after withdrawal
	const remainingBalance = useMemo(() => {
		if (!amount || !balanceData.vaultAssetsBalance) return balanceData.vaultAssetsBalance || 0n;

		try {
			const amountInWei = parseUnits(amount, tokenDecimals);
			const remaining = balanceData.vaultAssetsBalance - amountInWei;
			return remaining >= 0n ? remaining : 0n;
		} catch {
			return balanceData.vaultAssetsBalance || 0n;
		}
	}, [amount, balanceData.vaultAssetsBalance, tokenDecimals]);

	const getBalanceInfo = () => {
		return {
			label: 'Available to withdraw',
			value: balanceData.maxWithdrawable
				? MarketService.formatTokenBalance(balanceData.maxWithdrawable, tokenDecimals)
				: '0',
		};
	};

	const getSubmitButtonText = () => {
		if (transactionState.isProcessing) {
			return 'Processing...';
		}

		if (!balanceData.maxWithdrawable || balanceData.maxWithdrawable === 0n) {
			return 'No vault shares to withdraw';
		}

		if (!amount) {
			return 'Enter an amount';
		}

		if (isInsufficientBalance) {
			return 'Insufficient balance';
		}

		return 'Withdraw';
	};

	const balanceInfo = getBalanceInfo();

	const isInsufficientBalance = useMemo(() => {
		if (!amount) return false;
		try {
			const pureNumber = parseFloat(amount.replace(/,/g, ''));
			const actualAmount = !isNaN(pureNumber) && isFinite(pureNumber) ? pureNumber : parseCompactNotation(amount);

			if (actualAmount === 0) return false;

			const amountInWei = parseUnits(actualAmount.toString(), tokenDecimals);
			const maxBalance = getMaxBalance();

			if (maxBalance === 0n) return false;

			const tolerance = maxBalance / 1000n;
			return amountInWei > maxBalance + tolerance;
		} catch {
			return false;
		}
	}, [amount, tokenDecimals, getMaxBalance, parseCompactNotation]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title=""
			customHeader={
				<CollectionModalHeader
					collectionData={collectionData}
					vaultAddress={vaultAddress}
					transactionType="withdraw"
					theme={theme}
				/>
			}>
			<FlexContainer variant="column" className={styles.container}>
				<FlexContainer variant="column" className={styles.section}>
					<FlexContainer variant="alignCenter" className={styles.sectionHeader}>
						<label className={styles.label}>Amount to Withdraw</label>
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
					</FlexContainer>

					<FlexContainer variant="alignCenter" className={styles.inputContainer}>
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
						<FlexContainer variant="alignCenter" className={styles.tokenInfo}>
							<FlexContainer variant="center" className={styles.tokenIcon}>
								<div className={styles.tokenSymbol}>{cleanSymbol.charAt(0)}</div>
							</FlexContainer>
							<span className={styles.tokenName}>{cleanSymbol}</span>
						</FlexContainer>
					</FlexContainer>

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

					<FlexContainer variant="spaceBetween" className={styles.balanceInfo}>
						{isInsufficientBalance ? (
							<FlexContainer variant="alignCenter" className={styles.insufficientBalance}>
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
							</FlexContainer>
						) : (
							<span className={styles.usdValue}>$ {usdValue}</span>
						)}
						<FlexContainer variant="alignCenter" className={styles.walletBalance}>
							<span>
								{balanceInfo.label} {balanceInfo.value}
							</span>
							<Button variant="outline" size="small" onClick={handleMaxClick}>
								MAX
							</Button>
						</FlexContainer>
					</FlexContainer>

					{/* Show helpful message when no vault shares */}
					{(!balanceData.maxWithdrawable || balanceData.maxWithdrawable === 0n) && (
						<FlexContainer variant="alignCenter" className={styles.insufficientBalance}>
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
								<circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" />
								<path
									d="M8 12V8M8 4H8.01"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
							<span>You don&apos;t have any vault shares for this collection. Make a deposit first.</span>
						</FlexContainer>
					)}
				</FlexContainer>

				{/* Transaction Overview */}
				<FlexContainer variant="column" className={styles.section}>
					<h3 className={styles.sectionTitle}>Transaction overview</h3>
					<div className={styles.overviewContainer}>
						<div className={styles.overviewRow}>
							<span className={styles.overviewLabel}>You will withdraw</span>
							<span className={styles.overviewValue}>
								{amount || '0'} {cleanSymbol}
							</span>
						</div>
						<div className={styles.overviewRow}>
							<span className={styles.overviewLabel}>Remaining vault balance</span>
							<span className={styles.overviewValue}>
								{MarketService.formatTokenBalance(remainingBalance, tokenDecimals)} {cleanSymbol}
							</span>
						</div>
						{vaultTokenData && (
							<div className={styles.overviewRow}>
								<span className={styles.overviewLabel}>Current APY</span>
								<span className={styles.overviewValue}>{vaultTokenData.supplyAPY}%</span>
							</div>
						)}
						{balanceData.vaultSharesBalance && balanceData.vaultSharesBalance > 0n ? (
							<div className={styles.overviewRow}>
								<span className={styles.overviewLabel}>Your vault shares</span>
								<span className={styles.overviewValue}>
									{MarketService.formatTokenBalance(balanceData.vaultSharesBalance, tokenDecimals)}
								</span>
							</div>
						) : null}
					</div>
				</FlexContainer>

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
					fullWidth>
					{getSubmitButtonText()}
				</Button>
			</FlexContainer>
		</Modal>
	);
};

export const CollectionWithdrawModal = typedMemo(CollectionWithdrawModalComponent);
