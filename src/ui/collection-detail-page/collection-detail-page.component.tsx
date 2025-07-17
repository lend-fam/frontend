import { type FC, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { Address } from 'viem';
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

import css from './collection-detail-page.module.css';

// Mock data structure based on ICollectionRegistry interface
interface CollectionData {
	collectionAddress: Address;
	collectionName: string;
	collectionType: 'ERC721' | 'ERC1155';
	yieldSharePercentage: number;
	weightFunction: {
		fnType: 'LINEAR' | 'EXPONENTIAL';
		p1: number;
		p2: number;
	};
	vaults: Address[];
	status: 'Active' | 'Inactive';
	totalValueLocked: string;
	totalYieldGenerated: string;
	createdAt: string;
}

// Mock data - replace with actual contract calls
const mockCollectionData: Record<string, CollectionData> = {
	'0x1234567890123456789012345678901234567890': {
		collectionAddress: '0x1234567890123456789012345678901234567890' as Address,
		collectionName: 'Bored Ape Yacht Club',
		collectionType: 'ERC721',
		yieldSharePercentage: 25,
		weightFunction: {
			fnType: 'LINEAR',
			p1: 100,
			p2: 0,
		},
		vaults: [
			'0xVault1234567890123456789012345678901234567890' as Address,
			'0xVault2345678901234567890123456789012345678901' as Address,
			'0xVault3456789012345678901234567890123456789012' as Address,
		],
		status: 'Active',
		totalValueLocked: '1,250,000',
		totalYieldGenerated: '45,320',
		createdAt: '2024-01-15',
	},
	'0x2345678901234567890123456789012345678901': {
		collectionAddress: '0x2345678901234567890123456789012345678901' as Address,
		collectionName: 'Mutant Ape Yacht Club',
		collectionType: 'ERC721',
		yieldSharePercentage: 20,
		weightFunction: {
			fnType: 'EXPONENTIAL',
			p1: 50,
			p2: 2,
		},
		vaults: [
			'0xVault4567890123456789012345678901234567890123' as Address,
			'0xVault5678901234567890123456789012345678901234' as Address,
		],
		status: 'Active',
		totalValueLocked: '850,000',
		totalYieldGenerated: '32,150',
		createdAt: '2024-02-10',
	},
};

const CollectionDetailPageComponent: FC = () => {
	const { collectionAddress } = useParams<{ collectionAddress: string }>();
	const [searchParams] = useSearchParams();
	const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);

	const selectedVault = searchParams.get('vault') as Address | null;

	if (!collectionAddress) {
		return (
			<Layout>
				<div className={css.container}>
					<EmptyState message="Collection not found" />
				</div>
			</Layout>
		);
	}

	// TODO: Replace with actual contract data loading
	const isLoading = false;
	const collectionData = mockCollectionData[collectionAddress];

	if (isLoading) {
		return (
			<Layout>
				<div className={css.container}>
					<LoadingState title="Loading Collection" message="Fetching collection data from blockchain..." />
				</div>
			</Layout>
		);
	}

	if (!collectionData) {
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
					onManageClick={() => setIsManagementModalOpen(true)}
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
export type { CollectionData };
