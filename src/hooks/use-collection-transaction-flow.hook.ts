import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { Address } from 'viem';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, maxUint256 } from 'viem';
import { useQueryClient } from '@tanstack/react-query';

import { COLLECTIONS_VAULT_ABI, ERC20_ABI } from '../contracts';

// Extended ABI with deposit/withdraw functions for collection vaults
// Based on CollectionVault.sol and CollectionVaultBase.sol contracts
const COLLECTIONS_VAULT_EXTENDED_ABI = [
	...COLLECTIONS_VAULT_ABI,
	{
		type: 'function',
		name: 'deposit',
		inputs: [
			{ name: 'collectionId', type: 'uint256', internalType: 'uint256' },
			{ name: 'assets', type: 'uint256', internalType: 'uint256' },
			{ name: 'receiver', type: 'address', internalType: 'address' },
		],
		outputs: [{ name: 'shares', type: 'uint256', internalType: 'uint256' }],
		stateMutability: 'nonpayable',
	},
	{
		type: 'function',
		name: 'withdraw',
		inputs: [
			{ name: 'collectionId', type: 'uint256', internalType: 'uint256' },
			{ name: 'assets', type: 'uint256', internalType: 'uint256' },
			{ name: 'receiver', type: 'address', internalType: 'address' },
		],
		outputs: [{ name: 'shares', type: 'uint256', internalType: 'uint256' }],
		stateMutability: 'nonpayable',
	},
	{
		type: 'function',
		name: 'redeem',
		inputs: [
			{ name: 'collectionId', type: 'uint256', internalType: 'uint256' },
			{ name: 'shares', type: 'uint256', internalType: 'uint256' },
			{ name: 'receiver', type: 'address', internalType: 'address' },
		],
		outputs: [{ name: 'assets', type: 'uint256', internalType: 'uint256' }],
		stateMutability: 'nonpayable',
	},
] as const;
import { useToastContext } from './use-toast-context.hook';
import { useAnalyticsContext } from './use-analytics-context.hook';
import type { VaultTokenData } from './use-vault-token-data.hook';

function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

export type CollectionTransactionType = 'deposit' | 'withdraw';

export interface CollectionTransactionConfig {
	type: CollectionTransactionType;
	collectionId: bigint;
	requiresApproval: boolean;
}

export interface CollectionTransactionState {
	isProcessing: boolean;
	hasAutoProceeded: boolean;
	needsApproval: boolean;
	isApprovePending: boolean;
	isApproveConfirming: boolean;
	isApproveSuccess: boolean;
	isApproveError: boolean;
	isTransactionPending: boolean;
	isTransactionConfirming: boolean;
	isTransactionSuccess: boolean;
	isTransactionError: boolean;
}

export interface CollectionTokenData {
	underlyingAssetAddress?: Address;
	tokenDecimals?: number;
	cleanSymbol: string;
}

export interface CollectionBalanceData {
	// User wallet balance of underlying asset
	walletBalance?: bigint;
	// User's vault shares balance for the collection
	vaultSharesBalance?: bigint;
	// Converted asset value of user's shares
	vaultAssetsBalance?: bigint;
	// Maximum withdrawable assets
	maxWithdrawable?: bigint;
	// Vault total assets for this collection
	totalAssets?: bigint;
	// Vault total shares for this collection
	totalShares?: bigint;
}

export interface CollectionApprovalSettings {
	useMaxApproval: boolean;
	currentAllowance?: bigint;
}

interface UseCollectionTransactionFlowParams {
	vaultAddress: Address;
	config: CollectionTransactionConfig;
	vaultTokenData?: VaultTokenData;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export const useCollectionTransactionFlow = ({
	vaultAddress,
	config,
	vaultTokenData,
	isOpen,
	onClose,
	onSuccess,
}: UseCollectionTransactionFlowParams) => {
	const [amount, setAmount] = useState('');
	const debouncedAmount = useDebounce(amount, 300);
	const [useMaxApproval, setUseMaxApproval] = useState(() => {
		const saved = localStorage.getItem('useMaxApproval');
		return saved !== null ? JSON.parse(saved) : true;
	});
	const [hasAutoProceeded, setHasAutoProceeded] = useState(false);
	const [transactionStarted, setTransactionStarted] = useState(false);
	const [, setIsMaxButtonClicked] = useState(false);
	const { address } = useAccount();
	const lastSuccessTimeRef = useRef<number>(0);
	const queryClient = useQueryClient();
	const { showError } = useToastContext();
	const { trackTransactionStart, trackTransactionComplete, trackTransactionError } = useAnalyticsContext();

	// Underlying asset address and decimals from vault token data
	const underlyingAssetAddress = vaultTokenData?.underlyingAssetAddress;
	const tokenDecimals = vaultTokenData?.tokenDecimals || 18;
	const isNativeToken = !underlyingAssetAddress;

	// Get user's wallet balance of underlying asset
	const { data: walletBalance } = useReadContract({
		address: underlyingAssetAddress,
		abi: ERC20_ABI,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
		query: { enabled: !!address && !!underlyingAssetAddress && !isNativeToken },
	});

	// Get user's vault shares balance for this collection
	const { data: vaultSharesBalance } = useReadContract({
		address: vaultAddress,
		abi: COLLECTIONS_VAULT_ABI,
		functionName: 'balanceOf',
		args: address ? [address, config.collectionId] : undefined,
		query: { enabled: !!address && config.type === 'withdraw' },
	});

	// Debug: Log balance queries
	if (config.type === 'withdraw') {
		console.log('Collection Transaction Flow Debug:', {
			address,
			vaultAddress,
			collectionId: config.collectionId.toString(),
			vaultSharesBalance: vaultSharesBalance?.toString(),
			queryEnabled: !!address && config.type === 'withdraw',
		});
	}

	// Get vault totals for this collection
	const { data: totalAssets } = useReadContract({
		address: vaultAddress,
		abi: COLLECTIONS_VAULT_ABI,
		functionName: 'totalAssets',
		args: [config.collectionId],
		query: { enabled: true },
	});

	const { data: totalShares } = useReadContract({
		address: vaultAddress,
		abi: COLLECTIONS_VAULT_ABI,
		functionName: 'totalShares',
		args: [config.collectionId],
		query: { enabled: true },
	});

	// Convert user's shares to assets for withdraw calculations
	const { data: vaultAssetsBalance } = useReadContract({
		address: vaultAddress,
		abi: COLLECTIONS_VAULT_ABI,
		functionName: 'convertToAssets',
		args: vaultSharesBalance ? [config.collectionId, vaultSharesBalance] : undefined,
		query: { enabled: !!vaultSharesBalance && vaultSharesBalance > 0n },
	});

	// Debug: Log conversion
	if (config.type === 'withdraw' && vaultSharesBalance) {
		console.log('Convert to Assets Debug:', {
			vaultSharesBalance: vaultSharesBalance.toString(),
			vaultAssetsBalance: vaultAssetsBalance?.toString(),
			conversionEnabled: !!vaultSharesBalance && vaultSharesBalance > 0n,
		});
	}

	// Get current allowance for deposits
	const { data: currentAllowance } = useReadContract({
		address: underlyingAssetAddress,
		abi: ERC20_ABI,
		functionName: 'allowance',
		args: address && underlyingAssetAddress ? [address, vaultAddress] : undefined,
		query: { enabled: !!address && !!underlyingAssetAddress && !isNativeToken && config.requiresApproval },
	});

	const { writeContract: approve, data: approveHash, isPending: isApprovePending } = useWriteContract();
	const {
		isLoading: isApproveConfirming,
		isSuccess: isApproveSuccess,
		isError: isApproveError,
	} = useWaitForTransactionReceipt({ hash: approveHash });

	const {
		writeContract: executeTransaction,
		data: transactionHash,
		isPending: isTransactionPending,
	} = useWriteContract();
	const {
		isLoading: isTransactionConfirming,
		isSuccess: isTransactionSuccess,
		isError: isTransactionError,
	} = useWaitForTransactionReceipt({ hash: transactionHash });

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

	const amountInWei = useMemo(() => {
		if (!debouncedAmount) return 0n;
		try {
			let actualAmount: number;
			const pureNumber = parseFloat(debouncedAmount.replace(/,/g, ''));
			if (!isNaN(pureNumber) && isFinite(pureNumber)) {
				actualAmount = pureNumber;
			} else {
				actualAmount = parseCompactNotation(debouncedAmount);
			}

			if (actualAmount === 0 || !isFinite(actualAmount)) return 0n;

			const decimalString = actualAmount.toFixed(tokenDecimals);
			const result = parseUnits(decimalString, tokenDecimals);

			return result;
		} catch {
			return 0n;
		}
	}, [debouncedAmount, tokenDecimals, parseCompactNotation]);

	const maxAvailable = useMemo(() => {
		switch (config.type) {
			case 'deposit': {
				return walletBalance || 0n;
			}
			case 'withdraw': {
				return vaultAssetsBalance || 0n;
			}
			default: {
				return 0n;
			}
		}
	}, [config.type, walletBalance, vaultAssetsBalance]);

	const needsApproval = useMemo(() => {
		if (!config.requiresApproval || !amountInWei || amountInWei === 0n) return false;
		if (isNativeToken || config.type === 'withdraw') return false;
		const allowance = currentAllowance ?? 0n;
		return allowance < amountInWei;
	}, [config.requiresApproval, config.type, currentAllowance, amountInWei, isNativeToken]);

	const isValidAmount = useMemo(() => {
		if (!debouncedAmount || amountInWei <= 0n) return false;

		const tolerance = maxAvailable > 1000n ? maxAvailable / 1000n : 1n;
		const maxWithTolerance = maxAvailable + tolerance;

		return amountInWei <= maxWithTolerance;
	}, [debouncedAmount, amountInWei, maxAvailable]);

	const isProcessing = isApprovePending || isApproveConfirming || isTransactionPending || isTransactionConfirming;

	const executeMainTransaction = useCallback(() => {
		setTransactionStarted(true);

		// Track transaction start
		const tokenSymbol = vaultTokenData?.tokenSymbol || 'Unknown';
		const formattedAmount = formatUnits(amountInWei, tokenDecimals);
		trackTransactionStart(config.type, tokenSymbol, formattedAmount);

		switch (config.type) {
			case 'deposit': {
				executeTransaction({
					address: vaultAddress,
					abi: COLLECTIONS_VAULT_EXTENDED_ABI,
					functionName: 'deposit',
					args: [config.collectionId, amountInWei, address!],
				});
				break;
			}
			case 'withdraw': {
				// For withdrawals, we specify the assets amount to withdraw
				// The contract will calculate and burn the required shares
				executeTransaction({
					address: vaultAddress,
					abi: COLLECTIONS_VAULT_EXTENDED_ABI,
					functionName: 'withdraw',
					args: [config.collectionId, amountInWei, address!],
				});
				break;
			}
		}
	}, [
		config.type,
		config.collectionId,
		executeTransaction,
		vaultAddress,
		amountInWei,
		address,
		trackTransactionStart,
		vaultTokenData,
		tokenDecimals,
	]);

	// Auto-proceed after approval success
	useEffect(() => {
		if (
			isOpen &&
			isApproveSuccess &&
			!isTransactionPending &&
			!isTransactionConfirming &&
			isValidAmount &&
			!hasAutoProceeded &&
			config.requiresApproval &&
			transactionStarted
		) {
			setHasAutoProceeded(true);
			executeMainTransaction();
		}
	}, [
		isOpen,
		isApproveSuccess,
		isTransactionPending,
		isTransactionConfirming,
		isValidAmount,
		hasAutoProceeded,
		config.requiresApproval,
		transactionStarted,
		executeMainTransaction,
	]);

	// Handle transaction success
	useEffect(() => {
		if (isTransactionSuccess && isOpen && transactionStarted) {
			lastSuccessTimeRef.current = Date.now();
			setHasAutoProceeded(false);
			setTransactionStarted(false);

			// Track transaction success
			const tokenSymbol = vaultTokenData?.tokenSymbol || 'Unknown';
			const formattedAmount = formatUnits(amountInWei, tokenDecimals);
			if (transactionHash) {
				trackTransactionComplete(config.type, tokenSymbol, formattedAmount, transactionHash);
			}

			// Invalidate relevant queries
			queryClient.invalidateQueries({
				predicate: (query) => {
					const queryKey = query.queryKey;
					if (!queryKey || !Array.isArray(queryKey)) return false;

					try {
						// Safe stringify that handles BigInt values
						const keyString = JSON.stringify(queryKey, (_, value) =>
							typeof value === 'bigint' ? value.toString() : value,
						).toLowerCase();

						return (
							keyString.includes('balanceof') ||
							keyString.includes('totalassets') ||
							keyString.includes('totalshares') ||
							keyString.includes('converttoassets') ||
							keyString.includes('collection') ||
							keyString.includes(address?.toLowerCase() || '') ||
							keyString.includes(vaultAddress.toLowerCase())
						);
					} catch {
						// Fallback: check individual elements for string matches
						return queryKey.some((key) => {
							if (typeof key === 'string') {
								const lowerKey = key.toLowerCase();
								return (
									lowerKey.includes('balanceof') ||
									lowerKey.includes('totalassets') ||
									lowerKey.includes('totalshares') ||
									lowerKey.includes('converttoassets') ||
									lowerKey.includes('collection') ||
									lowerKey === address?.toLowerCase() ||
									lowerKey === vaultAddress.toLowerCase()
								);
							}
							return false;
						});
					}
				},
			});

			if (onSuccess) {
				onSuccess();
			}
			onClose();
		}
	}, [
		isTransactionSuccess,
		isOpen,
		transactionStarted,
		onClose,
		onSuccess,
		config.type,
		queryClient,
		address,
		vaultAddress,
		vaultTokenData,
		amountInWei,
		tokenDecimals,
		transactionHash,
		trackTransactionComplete,
	]);

	// Reset state when modal opens
	useEffect(() => {
		if (isOpen) {
			setHasAutoProceeded(false);
			setTransactionStarted(false);
			setAmount('');
			setIsMaxButtonClicked(false);
		}
	}, [isOpen]);

	// Handle approval error
	useEffect(() => {
		if (isApproveError) {
			setHasAutoProceeded(false);
			showError('Token approval failed. Please try again.');
		}
	}, [isApproveError, showError]);

	// Handle transaction error
	useEffect(() => {
		if (isTransactionError) {
			setHasAutoProceeded(false);
			showError(`${config.type} transaction failed. Please try again.`);

			// Track transaction error
			const tokenSymbol = vaultTokenData?.tokenSymbol || 'Unknown';
			const formattedAmount = formatUnits(amountInWei, tokenDecimals);
			trackTransactionError(config.type, tokenSymbol, formattedAmount, 'Transaction failed');
		}
	}, [isTransactionError, config.type, showError, vaultTokenData, amountInWei, tokenDecimals, trackTransactionError]);

	const handleMaxClick = () => {
		if (maxAvailable > 0n) {
			const formatted = formatUnits(maxAvailable, tokenDecimals);
			const number = parseFloat(formatted);
			const finalAmount = number.toFixed(Math.min(8, tokenDecimals));
			setAmount(finalAmount);
			setIsMaxButtonClicked(true);
		}
	};

	const handleApprove = () => {
		if (!underlyingAssetAddress || !isValidAmount) {
			return;
		}

		const approvalAmount = useMaxApproval ? maxUint256 : amountInWei;
		setTransactionStarted(true);
		approve({
			address: underlyingAssetAddress,
			abi: ERC20_ABI,
			functionName: 'approve',
			args: [vaultAddress, approvalAmount],
		});
	};

	const handleSubmit = () => {
		if (!isValidAmount) {
			return;
		}

		if (needsApproval) {
			handleApprove();
		} else {
			executeMainTransaction();
		}
	};

	const handleApprovalSettingChange = (checked: boolean) => {
		setUseMaxApproval(checked);
		localStorage.setItem('useMaxApproval', JSON.stringify(checked));
	};

	const transactionState: CollectionTransactionState = {
		isProcessing,
		hasAutoProceeded,
		needsApproval,
		isApprovePending,
		isApproveConfirming,
		isApproveSuccess,
		isApproveError,
		isTransactionPending,
		isTransactionConfirming,
		isTransactionSuccess,
		isTransactionError,
	};

	const tokenData: CollectionTokenData = {
		underlyingAssetAddress,
		tokenDecimals,
		cleanSymbol: vaultTokenData?.tokenSymbol || 'Unknown',
	};

	const balanceData: CollectionBalanceData = {
		walletBalance,
		vaultSharesBalance,
		vaultAssetsBalance,
		maxWithdrawable: config.type === 'withdraw' ? maxAvailable : undefined,
		totalAssets,
		totalShares,
	};

	// Debug: Log final balance data
	if (config.type === 'withdraw') {
		console.log('Final Balance Data Debug:', {
			walletBalance: walletBalance?.toString(),
			vaultSharesBalance: vaultSharesBalance?.toString(),
			vaultAssetsBalance: vaultAssetsBalance?.toString(),
			maxWithdrawable: balanceData.maxWithdrawable?.toString(),
			maxAvailable: maxAvailable?.toString(),
		});
	}

	const approvalSettings: CollectionApprovalSettings = {
		useMaxApproval,
		currentAllowance,
	};

	return {
		amount,
		setAmount,
		transactionState,
		tokenData,
		balanceData,
		approvalSettings,
		amountInWei,
		maxAvailable,
		isValidAmount,
		lastSuccessTime: lastSuccessTimeRef.current,
		handleMaxClick,
		handleSubmit,
		handleApprovalSettingChange,
	};
};
