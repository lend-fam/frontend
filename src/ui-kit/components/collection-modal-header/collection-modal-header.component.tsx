import type { FC } from 'react';
import type { Address } from 'viem';
import { FlexContainer } from '../flex-container/flex-container.component';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';
import type { CollectionDetailData } from '../../../ui/collection-detail-page/collection-detail-page.component';

import css from './collection-modal-header.module.css';

export interface CollectionModalHeaderProps {
	collectionData: CollectionDetailData;
	vaultAddress?: Address;
	vaultName?: string;
	transactionType: 'deposit' | 'withdraw';
	theme?: Record<string, string>;
}

const CollectionModalHeaderComponent: FC<CollectionModalHeaderProps> = ({
	collectionData,
	vaultAddress,
	vaultName,
	transactionType,
	theme,
}) => {
	const styles = useTheme(css, theme);

	// Find the specific vault info from collection data
	const vaultInfo = vaultAddress
		? collectionData.vaults.find((vault) => vault.address === vaultAddress)
		: collectionData.vaults[0];

	const displayVaultName = vaultName || vaultInfo?.name || 'Collection Vault';
	const displayTransactionType = transactionType.charAt(0).toUpperCase() + transactionType.slice(1);

	return (
		<div className={styles.container}>
			<FlexContainer variant="spaceBetween" className={styles.headerRow}>
				<div className={styles.leftSection}>
					<FlexContainer variant="alignCenter" className={styles.titleSection}>
						<div className={styles.collectionIcon}>
							<div className={styles.collectionSymbol}>
								{collectionData.collectionName.charAt(0).toUpperCase()}
							</div>
						</div>
						<div className={styles.titleInfo}>
							<h2 className={styles.modalTitle}>
								{displayTransactionType} {collectionData.collectionName}
							</h2>
							<p className={styles.vaultSubtitle}>{displayVaultName}</p>
						</div>
					</FlexContainer>
				</div>
			</FlexContainer>
		</div>
	);
};

export const CollectionModalHeader = typedMemo(CollectionModalHeaderComponent);
