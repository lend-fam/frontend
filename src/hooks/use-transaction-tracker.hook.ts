import { useState, useEffect, useCallback } from 'react';
import type { Address, Hash } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, useAccount } from 'wagmi';

export type TransactionState = 'idle' | 'preparing' | 'pending' | 'confirming' | 'success' | 'error';

export interface TransactionStep {
	id: string;
	title: string;
	description: string;
	state: TransactionState;
	hash?: Hash;
	error?: string;
}

export interface UseTransactionTrackerOptions {
	contractAddress?: Address;
	eventName?: string;
	eventFilter?: Record<string, unknown>;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
	onStepComplete?: (step: TransactionStep) => void;
}

export interface ContractCall {
	address: Address;
	abi: readonly unknown[];
	functionName: string;
	args?: readonly unknown[];
}

export interface TransactionTrackerResult {
	steps: TransactionStep[];
	currentStep: TransactionStep | null;
	isProcessing: boolean;
	executeTransaction: (contractCall: ContractCall) => void;
	addStep: (step: Omit<TransactionStep, 'state'>) => void;
	updateStep: (stepId: string, updates: Partial<TransactionStep>) => void;
	reset: () => void;
}

export function useTransactionTracker(options: UseTransactionTrackerOptions = {}): TransactionTrackerResult {
	const [steps, setSteps] = useState<TransactionStep[]>([]);
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const { address } = useAccount();

	const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();

	const {
		isLoading: isConfirming,
		isSuccess: isConfirmed,
		isError: isConfirmError,
		error: confirmError,
	} = useWaitForTransactionReceipt({ hash });

	// Watch for contract events if specified
	useWatchContractEvent({
		address: options.contractAddress,
		eventName: options.eventName as string,
		args: options.eventFilter,
		onLogs: (logs) => {
			// Check if any log matches our transaction
			const relevantLog = logs.find(
				(log) =>
					log.transactionHash === hash ||
					(address && (log as any).args?.from === address) ||
					(address && (log as any).args?.to === address),
			);

			if (relevantLog && options.onStepComplete) {
				const currentStep = steps[currentStepIndex];
				if (currentStep) {
					options.onStepComplete({
						...currentStep,
						state: 'success',
					});
				}
			}
		},
		enabled: !!options.contractAddress && !!options.eventName && !!hash,
	});

	const addStep = useCallback((step: Omit<TransactionStep, 'state'>) => {
		setSteps((prev) => [...prev, { ...step, state: 'idle' }]);
	}, []);

	const updateStep = useCallback((stepId: string, updates: Partial<TransactionStep>) => {
		setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, ...updates } : step)));
	}, []);

	const executeTransaction = useCallback(
		(contractCall: ContractCall) => {
			const currentStep = steps[currentStepIndex];
			if (!currentStep) return;

			updateStep(currentStep.id, { state: 'preparing' });
			writeContract(contractCall);
		},
		[writeContract, steps, currentStepIndex, updateStep],
	);

	const reset = useCallback(() => {
		setSteps([]);
		setCurrentStepIndex(0);
	}, []);

	// Handle transaction state changes
	useEffect(() => {
		const currentStep = steps[currentStepIndex];
		if (!currentStep) return;

		if (isWritePending) {
			updateStep(currentStep.id, { state: 'pending' });
		} else if (hash && isConfirming) {
			updateStep(currentStep.id, {
				state: 'confirming',
				hash,
			});
		} else if (isConfirmed) {
			updateStep(currentStep.id, { state: 'success' });

			// Move to next step if available
			if (currentStepIndex < steps.length - 1) {
				setCurrentStepIndex((prev) => prev + 1);
			} else {
				// All steps completed
				options.onSuccess?.();
			}
		} else if (writeError || isConfirmError) {
			const error = writeError || confirmError;
			updateStep(currentStep.id, {
				state: 'error',
				error: error?.message || 'Transaction failed',
			});
			options.onError?.(error as Error);
		}
	}, [
		isWritePending,
		hash,
		isConfirming,
		isConfirmed,
		writeError,
		isConfirmError,
		confirmError,
		steps,
		currentStepIndex,
		updateStep,
		options,
	]);

	const currentStep = steps[currentStepIndex] || null;
	const isProcessing = steps.some((step) => ['preparing', 'pending', 'confirming'].includes(step.state));

	return {
		steps,
		currentStep,
		isProcessing,
		executeTransaction,
		addStep,
		updateStep,
		reset,
	};
}

// Specialized hook for approval + main transaction pattern
export function useApprovalTransaction(options: {
	tokenAddress?: Address;
	spenderAddress?: Address;
	mainContractAddress?: Address;
	onComplete?: () => void;
	onError?: (error: Error) => void;
}) {
	const tracker = useTransactionTracker({
		contractAddress: options.mainContractAddress,
		onSuccess: options.onComplete,
		onError: options.onError,
	});

	const initializeSteps = useCallback(
		(needsApproval: boolean, actionName: string) => {
			tracker.reset();

			if (needsApproval) {
				tracker.addStep({
					id: 'approval',
					title: 'Token Approval',
					description: 'Approve token spending',
				});
			}

			tracker.addStep({
				id: 'main',
				title: actionName,
				description: `Execute ${actionName.toLowerCase()} transaction`,
			});
		},
		[tracker],
	);

	return {
		...tracker,
		initializeSteps,
	};
}
