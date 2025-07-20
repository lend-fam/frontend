import { type FC, useCallback } from 'react';
import { Badge } from '../../../ui-kit/components/badge/badge.component';
import { typedMemo } from '../../../ui-kit/utils/typed-memo.utils';
import { useClipboard } from '../../../hooks/use-clipboard.hook';
import type { CollectionData } from '../collection-detail-page.component';

import css from './collection-header.module.css';

interface CollectionHeaderProps {
	collectionData: CollectionData;
	onManageClick?: () => void;
}

const CollectionHeaderComponent: FC<CollectionHeaderProps> = ({ collectionData, onManageClick }) => {
	const {
		collectionName,
		collectionAddress,
		collectionType,
		status,
		totalValueLocked,
		totalYieldGenerated,
		createdAt,
	} = collectionData;

	const { isCopied, copyToClipboard } = useClipboard({
		successMessage: `${collectionName} address copied`,
	});

	const handleCopyAddress = useCallback(async () => {
		await copyToClipboard(collectionAddress);
	}, [collectionAddress, copyToClipboard]);

	const handleOpenScanner = useCallback(() => {
		// TODO: Add block explorer URL for collections
		const scannerUrl = `https://apescan.io/address/${collectionAddress}`;
		window.open(scannerUrl, '_blank', 'noopener,noreferrer');
	}, [collectionAddress]);

	const statusVariant = status === 'Active' ? 'success' : 'neutral';
	const typeVariant = 'info';

	return (
		<div className={css.container}>
			<div className={css.tokenInfo}>
				<div className={css.tokenIcon}>🖼️</div>
				<div className={css.tokenDetails}>
					<h1 className={css.tokenName}>{collectionName}</h1>
					<div className={css.tokenSymbol}>
						<Badge variant={typeVariant} size="small">
							{collectionType}
						</Badge>
						<Badge variant={statusVariant} size="small">
							{status}
						</Badge>
					</div>
				</div>
				<div className={css.tokenActions}>
					<div className={css.actionButtons}>
						<button
							className={`${css.copyButton} ${isCopied ? css.copied : ''}`}
							onClick={handleCopyAddress}
							title={isCopied ? 'Copied!' : 'Copy collection address'}>
							{isCopied ? '✅' : '📋'}
						</button>
						<button
							className={css.externalButton}
							onClick={handleOpenScanner}
							title="View on block explorer">
							🔗
						</button>
					</div>
					{onManageClick && (
						<button className={css.manageButton} onClick={onManageClick} title="Manage collection">
							⚙️ Manage
						</button>
					)}
				</div>
			</div>

			<div className={css.metrics}>
				<div className={css.metric}>
					<span className={css.metricLabel}>Total Value Locked</span>
					<span className={css.metricValue}>${totalValueLocked}</span>
				</div>
				<div className={css.metric}>
					<span className={css.metricLabel}>Total Yield Generated</span>
					<span className={css.metricValue}>${totalYieldGenerated}</span>
				</div>
				<div className={css.metric}>
					<span className={css.metricLabel}>Active Vaults</span>
					<span className={css.metricValue}>{collectionData.vaults.length}</span>
				</div>
				<div className={css.metric}>
					<span className={css.metricLabel}>Created</span>
					<span className={css.metricValue}>{createdAt}</span>
				</div>
			</div>
		</div>
	);
};

export const CollectionHeader = typedMemo(CollectionHeaderComponent);
