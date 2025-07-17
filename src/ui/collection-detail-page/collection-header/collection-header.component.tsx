import { type FC, useCallback, useState } from 'react';
import { Badge } from '../../../ui-kit/components/badge/badge.component';
import { typedMemo } from '../../../ui-kit/utils/typed-memo.utils';
import type { CollectionData } from '../collection-detail-page.component';

import css from './collection-header.module.css';

interface CollectionHeaderProps {
	collectionData: CollectionData;
}

const CollectionHeaderComponent: FC<CollectionHeaderProps> = ({ collectionData }) => {
	const {
		collectionName,
		collectionAddress,
		collectionType,
		status,
		totalValueLocked,
		totalYieldGenerated,
		createdAt,
	} = collectionData;

	const [isCopied, setIsCopied] = useState(false);

	const handleCopyAddress = useCallback(async () => {
		try {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(collectionAddress);
			} else {
				const textArea = document.createElement('textarea');
				textArea.value = collectionAddress;
				textArea.style.position = 'fixed';
				textArea.style.left = '-999999px';
				textArea.style.top = '-999999px';
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				document.execCommand('copy');
				document.body.removeChild(textArea);
			}
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		} catch (error) {
			console.error('Failed to copy address:', error);
		}
	}, [collectionAddress]);

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
					<button
						className={`${css.copyButton} ${isCopied ? css.copied : ''}`}
						onClick={handleCopyAddress}
						title={isCopied ? 'Copied!' : 'Copy collection address'}>
						{isCopied ? '✅' : '📋'}
					</button>
					<button className={css.externalButton} onClick={handleOpenScanner} title="View on block explorer">
						🔗
					</button>
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
