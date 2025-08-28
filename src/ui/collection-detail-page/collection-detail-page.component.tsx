import { type FC, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';
import { Layout } from '../layout/layout.component';
import { CollectionHeader } from './collection-header/collection-header.component';
import { CollectionMetricsSection } from './collection-metrics-section/collection-metrics-section.component';
import { VaultInfoSection } from './vault-info-section/vault-info-section.component';
import { YieldConfigSection } from './yield-config-section/yield-config-section.component';
import { VaultFormsSection } from './vault-forms-section/vault-forms-section.component';
import { ManagementModal } from './management-modal/management-modal.component';
import { LoadingState } from '../../ui-kit/components/loading-state/loading-state.component';
import { EmptyState } from '../../ui-kit/components/empty-state/empty-state.component';
import { typedMemo } from '../../ui-kit/utils/typed-memo.utils';
import { useCollectionDetailData } from '../../hooks/use-collection-detail-data.hook';
import { useCollectionAuthInfo } from '../../hooks/use-collections-registry.hook';
import type { CollectionData as BaseCollectionData } from '../../hooks/use-collections-page-data.hook';

import css from './collection-detail-page.module.css';

// Extended collection data interface for detail page
export interface CollectionDetailData extends BaseCollectionData {
	// Existing fields from BaseCollectionData:
	// collectionAddress, collectionName, collectionType, yieldSharePercentage,
	// userOwnership, nftMultiplier, weightFunction, vaultCount, totalVaults, status, actions

	// Additional fields for detail view
	collectionId: bigint | null;
	vaults: VaultInfo[];
	totalValueLocked: string;
	totalYieldGenerated: string;
	createdAt: string;
	weightFunctionParameters: {
		fnType: 'LINEAR' | 'EXPONENTIAL';
		p1: number;
		p2: number;
		formula: string;
		description: string;
	};
}

// Individual vault information for the detail view
export interface VaultInfo {
	address: Address;
	name: string;
	totalAssets: string;
	status: 'Active' | 'Inactive';
	actions: string;
	userBalance?: string;
	userShares?: string;
}

const CollectionDetailPageComponent: FC = () => {
	const { collectionAddress } = useParams<{ collectionAddress: string }>();
	const [searchParams] = useSearchParams();
	const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
	const { address: userAddress } = useAccount();

	const selectedVault = searchParams.get('vault') as Address | null;

	// Fetch collection detail data using the new hook
	const {
		collectionData,
		loading: isLoading,
		error,
		isEmpty,
	} = useCollectionDetailData(collectionAddress as Address);

	// Check if the current user is authorized to manage this collection
	const { data: authData } = useCollectionAuthInfo(collectionData?.collectionId || 0n, userAddress);
	const isUserAuthorized = authData?.[0]?.result?.isUserAuthorized || false;

	if (!collectionAddress) {
		return (
			<Layout>
				<div className={css.container}>
					<EmptyState message="Collection address is required" />
				</div>
			</Layout>
		);
	}

	if (isLoading) {
		return (
			<Layout>
				<div className={css.container}>
					<LoadingState title="Loading Collection" message="Fetching collection data from blockchain..." />
				</div>
			</Layout>
		);
	}

	if (error) {
		return (
			<Layout>
				<div className={css.container}>
					<EmptyState message="Failed to load collection data. Please check your connection and try again." />
					{/* TODO: Add retry button */}
				</div>
			</Layout>
		);
	}

	if (isEmpty || !collectionData) {
		return (
			<Layout>
				<div className={css.container}>
					<EmptyState message="Collection not found or not registered" />
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className={css.container}>
				<CollectionHeader
					collectionData={collectionData}
					onManageClick={isUserAuthorized ? () => setIsManagementModalOpen(true) : undefined}
				/>

				<div className={css.content}>
					<div className={css.mainContent}>
						<CollectionMetricsSection collectionData={collectionData} />

						<VaultInfoSection collectionData={collectionData} />

						<YieldConfigSection collectionData={collectionData} />
					</div>

					<div className={css.sidebar}>
						<VaultFormsSection collectionData={collectionData} selectedVault={selectedVault || undefined} />
					</div>
				</div>

				<ManagementModal
					isOpen={isManagementModalOpen}
					onClose={() => setIsManagementModalOpen(false)}
					collectionData={collectionData}
				/>
			</div>
		</Layout>
	);
};

export const CollectionDetailPage = typedMemo(CollectionDetailPageComponent);
