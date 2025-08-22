import { type FC } from 'react';
import { Modal } from '../../../ui-kit/components/modal/modal.component';
import { Button } from '../../../ui-kit/components/button/button.component';
import { Badge } from '../../../ui-kit/components/badge/badge.component';
import { typedMemo } from '../../../ui-kit/utils/typed-memo.utils';
import type { CollectionDetailData } from '../collection-detail-page.component';

import css from './management-modal.module.css';

interface ManagementModalProps {
	isOpen: boolean;
	onClose: () => void;
	collectionData: CollectionDetailData;
}

const ManagementModalComponent: FC<ManagementModalProps> = ({ isOpen, onClose, collectionData }) => {
	const { status, yieldSharePercentage, weightFunction } = collectionData;

	// Mock authorization check - replace with actual wallet/permission check
	const isAuthorized = true;

	const handleEditYieldShare = () => {
		// TODO: Implement edit yield share functionality
	};

	const handleEditWeightFunction = () => {
		// TODO: Implement edit weight function functionality
	};

	const handleToggleStatus = () => {
		// TODO: Implement toggle status functionality
	};

	const handleRemoveCollection = () => {
		// TODO: Implement remove collection functionality
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Collection Management">
			<div className={css.container}>
				<div className={css.statusSection}>
					<div className={css.statusLabel}>Current Status</div>
					<Badge variant={status === 'Active' ? 'success' : 'neutral'}>{status}</Badge>
				</div>

				<div className={css.actionsSection}>
					<h3 className={css.sectionTitle}>Collection Actions</h3>

					<div className={css.actionGroup}>
						<Button
							variant="primary"
							size="medium"
							fullWidth
							disabled={!isAuthorized}
							onClick={handleEditYieldShare}>
							Edit Yield Share
						</Button>
						<div className={css.actionDescription}>
							Current: {yieldSharePercentage}% shared with holders
						</div>
					</div>

					<div className={css.actionGroup}>
						<Button
							variant="primary"
							size="medium"
							fullWidth
							disabled={!isAuthorized}
							onClick={handleEditWeightFunction}>
							Edit Weight Function
						</Button>
						<div className={css.actionDescription}>Current: {weightFunction?.type || 'N/A'}</div>
					</div>

					<div className={css.actionGroup}>
						<Button
							variant="secondary"
							size="medium"
							fullWidth
							disabled={!isAuthorized}
							onClick={handleToggleStatus}>
							{status === 'Active' ? 'Deactivate' : 'Activate'} Collection
						</Button>
						<div className={css.actionDescription}>
							{status === 'Active'
								? 'Pause yield distribution to holders'
								: 'Resume yield distribution to holders'}
						</div>
					</div>
				</div>

				<div className={css.dangerSection}>
					<h3 className={css.dangerTitle}>Danger Zone</h3>

					<div className={css.actionGroup}>
						<Button
							variant="outline"
							size="medium"
							fullWidth
							disabled={!isAuthorized}
							onClick={handleRemoveCollection}>
							Remove Collection
						</Button>
						<div className={css.dangerDescription}>
							Permanently remove this collection and stop all yield distribution. This action cannot be
							undone.
						</div>
					</div>
				</div>

				{!isAuthorized && (
					<div className={css.unauthorizedNotice}>
						<div className={css.unauthorizedTitle}>Access Restricted</div>
						<div className={css.unauthorizedText}>
							You don&apos;t have permission to manage this collection. Only collection owners and
							authorized addresses can perform management actions.
						</div>
					</div>
				)}
			</div>
		</Modal>
	);
};

export const ManagementModal = typedMemo(ManagementModalComponent);
