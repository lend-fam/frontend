import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';

import { COLLECTION_REGISTRY_ABI, getCollectionRegistryAddress } from '../contracts';
import { useToastContext } from './use-toast-context.hook';
import { useAnalyticsContext } from './use-analytics-context.hook';

export type CollectionManagementAction = 'setYieldShare' | 'setWeightFunction';

export interface CollectionManagementConfig {
	action: CollectionManagementAction;
	collectionId: bigint;
}

export interface CollectionManagementState {
	isProcessing: boolean;
	isTransactionPending: boolean;
	isTransactionConfirming: boolean;
	isTransactionSuccess: boolean;
	isTransactionError: boolean;
}

export interface WeightFunctionParams {
	fnType: number; // 0 = LINEAR, 1 = EXPONENTIAL, 2 = LOGARITHMIC
	p1: bigint;
	p2: bigint;
}

interface UseCollectionManagementParams {
	config: CollectionManagementConfig;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export const useCollectionManagement = ({ config, isOpen, onClose, onSuccess }: UseCollectionManagementParams) => {
	const [transactionStarted, setTransactionStarted] = useState(false);
	const { address } = useAccount();
	const chainId = useChainId();
	const queryClient = useQueryClient();
	const { showError, showSuccess } = useToastContext();
	const { track } = useAnalyticsContext();

	const contractAddress = getCollectionRegistryAddress(chainId);

	// Check if user is authorized for this collection
	const { data: isAuthorized } = useReadContract({
		address: contractAddress,
		abi: COLLECTION_REGISTRY_ABI,
		functionName: 'isAuthorizedForCollection',
		args: [config.collectionId, address!],
		query: {
			enabled: !!address && config.collectionId > 0n,
			staleTime: 30000, // 30 seconds
		},
	});

	const {
		writeContract: executeTransaction,
		data: transactionHash,
		isPending: isTransactionPending,
		reset: resetTransaction,
	} = useWriteContract();

	const {
		isLoading: isTransactionConfirming,
		isSuccess: isTransactionSuccess,
		isError: isTransactionError,
	} = useWaitForTransactionReceipt({ hash: transactionHash });

	const isProcessing = isTransactionPending || isTransactionConfirming;

	// Map UI weight function type to contract parameters
	// Based on protocol formulas from CollectionService:
	// Linear: weight = p1 + (p2 × nftBalance) / borrowBalance
	// Exponential: weight = (p1 × p2^nftBalance × borrowBalance) / EXP_SCALE^2
	const mapWeightFunctionToParams = useCallback((type: string): WeightFunctionParams => {
		const EXP_SCALE = BigInt(1e18); // Standard exponential scaling factor

		switch (type) {
			case 'linear':
				return {
					fnType: 0, // LINEAR
					p1: EXP_SCALE, // Base weight (1.0 in scaled format)
					p2: EXP_SCALE / 100n, // NFT multiplier (0.01 per NFT in scaled format)
				};
			case 'exponential':
				return {
					fnType: 1, // EXPONENTIAL
					p1: EXP_SCALE, // Base multiplier (1.0 in scaled format)
					p2: EXP_SCALE + EXP_SCALE / 10n, // Growth factor (1.1 in scaled format for compound growth)
				};
			default:
				return {
					fnType: 0,
					p1: EXP_SCALE,
					p2: EXP_SCALE / 100n,
				};
		}
	}, []);

	// Map UI weight function type to contract parameters with custom values
	const mapWeightFunctionToParamsCustom = useCallback(
		(type: string, p1: number, p2: number): WeightFunctionParams => {
			const EXP_SCALE = BigInt(1e18); // Standard exponential scaling factor

			// Convert input parameters to scaled format
			const p1Scaled = BigInt(Math.round(p1 * Number(EXP_SCALE)));
			const p2Scaled = BigInt(Math.round(p2 * Number(EXP_SCALE)));

			switch (type) {
				case 'linear':
					return {
						fnType: 0, // LINEAR
						p1: p1Scaled,
						p2: p2Scaled,
					};
				case 'exponential':
					return {
						fnType: 1, // EXPONENTIAL
						p1: p1Scaled,
						p2: p2Scaled,
					};
				default:
					return {
						fnType: 0,
						p1: p1Scaled,
						p2: p2Scaled,
					};
			}
		},
		[],
	);

	const executeYieldShareUpdate = useCallback(
		(yieldSharePercentage: number) => {
			if (!contractAddress || !address || !isAuthorized) {
				showError('Not authorized to manage this collection');
				return;
			}

			// Convert percentage to basis points for contract (e.g., 5% = 500 basis points)
			const yieldShareBps = Math.round(yieldSharePercentage * 100);

			setTransactionStarted(true);
			track('collection_yield_share_update_start', {
				collectionId: config.collectionId.toString(),
				yieldSharePercentage: yieldSharePercentage,
			});

			executeTransaction({
				address: contractAddress,
				abi: COLLECTION_REGISTRY_ABI,
				functionName: 'setYieldShare',
				args: [config.collectionId, yieldShareBps],
			});
		},
		[contractAddress, address, isAuthorized, config.collectionId, executeTransaction, showError, track],
	);

	const executeWeightFunctionUpdate = useCallback(
		(weightFunctionType: string, p1?: number, p2?: number) => {
			if (!contractAddress || !address || !isAuthorized) {
				showError('Not authorized to manage this collection');
				return;
			}

			// Use custom parameters if provided, otherwise use defaults
			const weightParams =
				p1 !== undefined && p2 !== undefined
					? mapWeightFunctionToParamsCustom(weightFunctionType, p1, p2)
					: mapWeightFunctionToParams(weightFunctionType);

			setTransactionStarted(true);
			track('collection_weight_function_update_start', {
				collectionId: config.collectionId.toString(),
				weightFunctionType: weightFunctionType,
				p1: p1?.toString() || 'default',
				p2: p2?.toString() || 'default',
			});

			executeTransaction({
				address: contractAddress,
				abi: COLLECTION_REGISTRY_ABI,
				functionName: 'setWeightFunction',
				args: [config.collectionId, weightParams as { fnType: number; p1: bigint; p2: bigint }], // Type assertion for ABI struct compatibility
			});
		},
		[
			contractAddress,
			address,
			isAuthorized,
			config.collectionId,
			executeTransaction,
			showError,
			track,
			mapWeightFunctionToParams,
			mapWeightFunctionToParamsCustom,
		],
	);

	// Handle transaction success
	useEffect(() => {
		if (isTransactionSuccess && isOpen && transactionStarted) {
			setTransactionStarted(false);

			// Track transaction success
			if (transactionHash) {
				track('collection_management_transaction_complete', {
					action: config.action,
					collectionId: config.collectionId.toString(),
					transactionHash: transactionHash,
				});
			}

			// Show success message
			const actionName = config.action === 'setYieldShare' ? 'Yield share' : 'Weight function';
			showSuccess(`${actionName} updated successfully`);

			// Invalidate collection-related queries
			queryClient.invalidateQueries({
				predicate: (query) => {
					const queryKey = query.queryKey;
					if (!queryKey || !Array.isArray(queryKey)) return false;

					try {
						const keyString = JSON.stringify(queryKey, (_, value) =>
							typeof value === 'bigint' ? value.toString() : value,
						).toLowerCase();

						return (
							keyString.includes('collection') ||
							keyString.includes('registry') ||
							keyString.includes(contractAddress.toLowerCase()) ||
							keyString.includes(config.collectionId.toString())
						);
					} catch {
						return queryKey.some((key) => {
							if (typeof key === 'string') {
								const lowerKey = key.toLowerCase();
								return (
									lowerKey.includes('collection') ||
									lowerKey.includes('registry') ||
									lowerKey === contractAddress.toLowerCase()
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
		config.action,
		config.collectionId,
		queryClient,
		contractAddress,
		transactionHash,
		track,
		showSuccess,
	]);

	// Handle transaction error
	useEffect(() => {
		if (isTransactionError && transactionStarted) {
			setTransactionStarted(false);
			const actionName = config.action === 'setYieldShare' ? 'yield share' : 'weight function';
			showError(`Failed to update ${actionName}. Please try again.`);
			track('collection_management_transaction_error', {
				action: config.action,
				collectionId: config.collectionId.toString(),
				error: 'Transaction failed',
			});
		}
	}, [isTransactionError, transactionStarted, config.action, config.collectionId, showError, track]);

	// Reset state when modal opens
	useEffect(() => {
		if (isOpen) {
			setTransactionStarted(false);
			resetTransaction();
		}
	}, [isOpen, resetTransaction]);

	const transactionState: CollectionManagementState = {
		isProcessing,
		isTransactionPending,
		isTransactionConfirming,
		isTransactionSuccess,
		isTransactionError,
	};

	return {
		transactionState,
		isAuthorized: Boolean(isAuthorized),
		executeYieldShareUpdate,
		executeWeightFunctionUpdate,
	};
};
