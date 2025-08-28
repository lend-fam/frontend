import { type FC, useState, useCallback, useEffect } from 'react';
import { Modal } from '../../../ui-kit/components/modal/modal.component';
import { FlexContainer } from '../../../ui-kit/components/flex-container/flex-container.component';
import { Button } from '../../../ui-kit/components/button/button.component';
import { Badge } from '../../../ui-kit/components/badge/badge.component';
import { typedMemo } from '../../../ui-kit/utils/typed-memo.utils';
import { useTheme } from '../../../ui-kit/hooks/use-theme.hook';
import type { CollectionDetailData } from '../collection-detail-page.component';
import { useCollectionManagement } from '../../../hooks/use-collection-management.hook';

import css from './management-modal.module.css';

interface ManagementModalProps {
	isOpen: boolean;
	onClose: () => void;
	collectionData: CollectionDetailData;
	theme?: Record<string, string>;
	onSuccess?: () => void;
}

const ManagementModalComponent: FC<ManagementModalProps> = ({ isOpen, onClose, collectionData, theme, onSuccess }) => {
	const styles = useTheme(css, theme);
	const { status, yieldSharePercentage, weightFunction, weightFunctionParameters } = collectionData;

	// State for editing modes
	const [editMode, setEditMode] = useState<'yieldShare' | 'weightFunction' | null>(null);
	const [yieldShareInput, setYieldShareInput] = useState(yieldSharePercentage?.toString() || '0');
	const [weightFunctionInput, setWeightFunctionInput] = useState(weightFunction?.type?.toLowerCase() || 'linear');
	const [p1Input, setP1Input] = useState(weightFunctionParameters?.p1?.toString() || '1.0');
	const [p2Input, setP2Input] = useState(weightFunctionParameters?.p2?.toString() || '0.01');

	// Collection management hook for yield share operations
	const yieldShareManagement = useCollectionManagement({
		config: {
			action: 'setYieldShare',
			collectionId: BigInt(collectionData.collectionId || '0'),
		},
		isOpen: isOpen && editMode === 'yieldShare',
		onClose: () => setEditMode(null),
		onSuccess,
	});

	// Collection management hook for weight function operations
	const weightFunctionManagement = useCollectionManagement({
		config: {
			action: 'setWeightFunction',
			collectionId: BigInt(collectionData.collectionId || '0'),
		},
		isOpen: isOpen && editMode === 'weightFunction',
		onClose: () => setEditMode(null),
		onSuccess,
	});

	// Use authorization from the hooks (both should return the same value)
	const isAuthorized = yieldShareManagement.isAuthorized;

	// Combine transaction states for UI display
	const isProcessing =
		yieldShareManagement.transactionState.isProcessing || weightFunctionManagement.transactionState.isProcessing;

	// Reset states when modal opens/closes
	const resetStates = useCallback(() => {
		setEditMode(null);
		setYieldShareInput(yieldSharePercentage?.toString() || '0');
		setWeightFunctionInput(weightFunction?.type?.toLowerCase() || 'linear');

		// Set p1 and p2 based on current collection parameters, with fallbacks
		setP1Input(weightFunctionParameters?.p1?.toString() || '1.0');
		setP2Input(
			weightFunctionParameters?.p2?.toString() ||
				(weightFunction?.type?.toLowerCase() === 'exponential' ? '1.1' : '0.01'),
		);
	}, [yieldSharePercentage, weightFunction?.type, weightFunctionParameters?.p1, weightFunctionParameters?.p2]);

	// Handle modal open/close
	useEffect(() => {
		if (isOpen) {
			resetStates();
		}
	}, [isOpen, resetStates]);

	const handleEditYieldShare = () => {
		if (editMode === 'yieldShare') {
			// Submit yield share change
			handleSubmitYieldShare();
		} else {
			// Enter edit mode
			setEditMode('yieldShare');
		}
	};

	const handleEditWeightFunction = () => {
		if (editMode === 'weightFunction') {
			// Submit weight function change
			handleSubmitWeightFunction();
		} else {
			// Enter edit mode
			setEditMode('weightFunction');
		}
	};

	const handleCancelEdit = () => {
		setEditMode(null);
		setYieldShareInput(yieldSharePercentage?.toString() || '0');
		setWeightFunctionInput(weightFunction?.type?.toLowerCase() || 'linear');

		// Reset p1 and p2 to current collection parameters
		setP1Input(weightFunctionParameters?.p1?.toString() || '1.0');
		setP2Input(
			weightFunctionParameters?.p2?.toString() ||
				(weightFunction?.type?.toLowerCase() === 'exponential' ? '1.1' : '0.01'),
		);
	};

	const handleSubmitYieldShare = () => {
		const newValue = parseFloat(yieldShareInput);
		if (isNaN(newValue) || newValue < 0 || newValue > 100) {
			// Error will be shown via toast from the hook if there's an issue
			return;
		}

		// Call the hook's function to execute the transaction
		yieldShareManagement.executeYieldShareUpdate(newValue);
	};

	const handleSubmitWeightFunction = () => {
		// Validate p1 and p2 parameters
		const p1Value = parseFloat(p1Input);
		const p2Value = parseFloat(p2Input);

		if (isNaN(p1Value) || p1Value <= 0) {
			return;
		}

		if (isNaN(p2Value) || p2Value <= 0) {
			return;
		}

		// Additional validation based on function type
		if (weightFunctionInput === 'exponential') {
			// For exponential functions, p2 should typically be > 1 for growth
			if (p2Value <= 1) {
				// This is just a warning, not an error - user can still proceed
				console.warn('Exponential p2 parameter <= 1 may result in declining weights');
			}
		} else if (weightFunctionInput === 'linear') {
			// For linear functions, very large p2 values might cause overflow issues
			if (p2Value > 100) {
				console.warn('Large linear p2 parameter may cause calculation overflow');
			}
		}

		// Call the hook's function to execute the transaction with custom parameters
		weightFunctionManagement.executeWeightFunctionUpdate(weightFunctionInput, p1Value, p2Value);
	};

	// Handle weight function type change and update default parameters
	const handleWeightFunctionTypeChange = (newType: string) => {
		setWeightFunctionInput(newType);

		// If changing to the current function type, use current parameters; otherwise use defaults
		if (newType === weightFunction?.type?.toLowerCase()) {
			setP1Input(weightFunctionParameters?.p1?.toString() || '1.0');
			setP2Input(weightFunctionParameters?.p2?.toString() || (newType === 'exponential' ? '1.1' : '0.01'));
		} else {
			// Update default parameters based on function type
			if (newType === 'exponential') {
				setP1Input('1.0');
				setP2Input('1.1');
			} else {
				setP1Input('1.0');
				setP2Input('0.01');
			}
		}
	};

	// TODO: These operations are not yet supported by the Collection Registry contract
	// They will be hidden in the UI until contract support is added

	// const handleToggleStatus = () => {
	// 	// Not implemented - activate/deactivate functions not found in Collection Registry ABI
	// };

	// const handleRemoveCollection = () => {
	// 	// Not implemented - remove function not found in Collection Registry ABI
	// };

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Collection Management">
			<FlexContainer variant="column" className={styles.container}>
				{/* Status Section */}
				<FlexContainer variant="column" className={styles.section}>
					<FlexContainer variant="alignCenter" className={styles.sectionHeader}>
						<label className={styles.label}>Current Status</label>
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
					<div className={styles.statusContainer}>
						<FlexContainer variant="spaceBetween">
							<span className={styles.statusLabel}>Collection Status</span>
							<Badge variant={status === 'Active' ? 'success' : 'neutral'}>{status}</Badge>
						</FlexContainer>
					</div>
				</FlexContainer>

				{/* Actions Section */}
				<FlexContainer variant="column" className={styles.section}>
					<h3 className={styles.sectionTitle}>Collection Actions</h3>
					<div className={styles.actionsContainer}>
						<FlexContainer variant="column" className={styles.actionGroup}>
							{editMode === 'yieldShare' ? (
								<>
									<label className={`${styles.label} ${styles.functionTypeLabel}`}>Yield Share</label>
									<FlexContainer variant="alignCenter" className={styles.inputContainer}>
										<input
											type="number"
											value={yieldShareInput}
											onChange={(e) => setYieldShareInput(e.target.value)}
											placeholder="0-100"
											min="0"
											max="100"
											step="0.1"
											className={styles.editInput}
											disabled={isProcessing}
										/>
										<span className={styles.inputSuffix}>%</span>
									</FlexContainer>
									<FlexContainer variant="alignCenter" className={styles.editActions}>
										<Button
											variant="outline"
											size="small"
											onClick={handleCancelEdit}
											disabled={isProcessing}
											className={styles.cancelButton}>
											Cancel
										</Button>
										<Button
											variant="primary"
											size="small"
											onClick={handleEditYieldShare}
											loading={yieldShareManagement.transactionState.isProcessing}
											disabled={isProcessing}
											className={styles.submitButton}>
											Submit
										</Button>
									</FlexContainer>
								</>
							) : (
								<>
									<Button
										variant="primary"
										size="medium"
										fullWidth
										disabled={!isAuthorized || isProcessing}
										onClick={handleEditYieldShare}>
										Edit Yield Share
									</Button>
									<div className={styles.actionDescription}>
										Current: {yieldSharePercentage}% shared with holders
									</div>
								</>
							)}
						</FlexContainer>

						<FlexContainer variant="column" className={styles.actionGroup}>
							{editMode === 'weightFunction' ? (
								<>
									<FlexContainer variant="column" className={styles.parameterContainer}>
										{/* Weight Function Type Selector */}
										<FlexContainer variant="column">
											<label className={`${styles.label} ${styles.functionTypeLabel}`}>
												Function Type
											</label>
											<select
												value={weightFunctionInput}
												onChange={(e) => handleWeightFunctionTypeChange(e.target.value)}
												className={styles.editSelect}
												disabled={isProcessing}>
												<option value="linear">Linear</option>
												<option value="exponential">Exponential</option>
											</select>
										</FlexContainer>

										{/* Parameter Inputs */}
										<FlexContainer direction="row" className={styles.parameterInputs}>
											<FlexContainer variant="column" className={styles.parameterInput}>
												<label className={styles.label}>P1 Parameter</label>
												<FlexContainer className={styles.inputContainer}>
													<input
														type="number"
														value={p1Input}
														onChange={(e) => setP1Input(e.target.value)}
														className={styles.editInput}
														disabled={isProcessing}
														step="0.01"
														min="0"
														placeholder={weightFunctionParameters?.p1?.toString() || '1.0'}
														lang="en-US"
													/>
												</FlexContainer>
											</FlexContainer>
											<FlexContainer variant="column" className={styles.parameterInput}>
												<label className={styles.label}>P2 Parameter</label>
												<FlexContainer className={styles.inputContainer}>
													<input
														type="number"
														value={p2Input}
														onChange={(e) => setP2Input(e.target.value)}
														className={styles.editInput}
														disabled={isProcessing}
														step="0.01"
														min="0"
														placeholder={
															weightFunctionParameters?.p2?.toString() ||
															(weightFunction?.type?.toLowerCase() === 'exponential'
																? '1.1'
																: '0.01')
														}
														lang="en-US"
													/>
												</FlexContainer>
											</FlexContainer>
										</FlexContainer>

										{/* Formula Description */}
										<div className={styles.actionDescription}>
											{weightFunctionInput === 'linear' &&
												`Linear: weight = ${p1Input} + (${p2Input} × NFTs owned) / borrow amount`}
											{weightFunctionInput === 'exponential' &&
												`Exponential: weight = (${p1Input} × ${p2Input}^NFTs × borrow amount) / 10^36`}
										</div>
									</FlexContainer>
									<FlexContainer variant="alignCenter" className={styles.editActions}>
										<Button
											variant="outline"
											size="small"
											onClick={handleCancelEdit}
											disabled={isProcessing}
											className={styles.cancelButton}>
											Cancel
										</Button>
										<Button
											variant="primary"
											size="small"
											onClick={handleEditWeightFunction}
											loading={weightFunctionManagement.transactionState.isProcessing}
											disabled={isProcessing}
											className={styles.submitButton}>
											Submit
										</Button>
									</FlexContainer>
								</>
							) : (
								<>
									<Button
										variant="primary"
										size="medium"
										fullWidth
										disabled={!isAuthorized || isProcessing}
										onClick={handleEditWeightFunction}>
										Edit Weight Function
									</Button>
									<div className={styles.actionDescription}>
										Current: {weightFunction?.type || 'N/A'}
									</div>
								</>
							)}
						</FlexContainer>

						{/* TODO: Activate/Deactivate functionality not yet supported by Collection Registry contract
						<FlexContainer variant="column" className={styles.actionGroup}>
							<Button
								variant="secondary"
								size="medium"
								fullWidth
								disabled={!isAuthorized || isProcessing}>
								{status === 'Active' ? 'Deactivate' : 'Activate'} Collection
							</Button>
							<div className={styles.actionDescription}>
								{status === 'Active'
									? 'Pause yield distribution to holders'
									: 'Resume yield distribution to holders'}
							</div>
						</FlexContainer>
						*/}
					</div>
				</FlexContainer>

				{/* Danger Section - Hidden until remove functionality is supported
				<FlexContainer variant="column" className={styles.section}>
					<h3 className={styles.dangerTitle}>Danger Zone</h3>
					<div className={styles.dangerContainer}>
						<FlexContainer variant="column" className={styles.actionGroup}>
							<Button
								variant="outline"
								size="medium"
								fullWidth
								disabled={!isAuthorized || isProcessing}>
								Remove Collection
							</Button>
							<div className={styles.dangerDescription}>
								Permanently remove this collection and stop all yield distribution. This action cannot be
								undone.
							</div>
						</FlexContainer>
					</div>
				</FlexContainer>
				*/}

				{/* Transaction status and errors are now handled via toast notifications in the hooks */}

				{/* Unauthorized Notice */}
				{!isAuthorized && (
					<FlexContainer variant="column" className={styles.section}>
						<div className={styles.unauthorizedNotice}>
							<div className={styles.unauthorizedTitle}>Access Restricted</div>
							<div className={styles.unauthorizedText}>
								You don&apos;t have permission to manage this collection. Only collection owners and
								authorized addresses can perform management actions.
							</div>
						</div>
					</FlexContainer>
				)}
			</FlexContainer>
		</Modal>
	);
};

export const ManagementModal = typedMemo(ManagementModalComponent);
