import { type FC, useMemo } from 'react';
import type { Address } from 'viem';
import { Card } from '../../../ui-kit/components/card/card.component';
import { SectionHeader } from '../../../ui-kit/components/section-header/section-header.component';
import { Table, type TableColumnProps, type TableData } from '../../../ui-kit/components/table/table.component';
import { Button } from '../../../ui-kit/components/button/button.component';
import { Badge } from '../../../ui-kit/components/badge/badge.component';
import { typedMemo } from '../../../ui-kit/utils/typed-memo.utils';
import type { CollectionData } from '../collection-detail-page.component';

import css from './vault-info-section.module.css';

interface VaultInfoSectionProps {
	collectionData: CollectionData;
}

// Mock vault data structure
interface VaultData {
	address: Address;
	name: string;
	totalAssets: string;
	totalShares: string;
	apy: string;
	status: 'Active' | 'Inactive';
	createdAt: string;
	actions: string;
}

type VaultTableColumn = 'name' | 'totalAssets' | 'totalShares' | 'apy' | 'status' | 'actions';

// Mock vault data - replace with actual contract calls
const mockVaultData: Record<string, VaultData> = {
	'0xVault1234567890123456789012345678901234567890': {
		address: '0xVault1234567890123456789012345678901234567890' as Address,
		name: 'BAYC Vault #1',
		totalAssets: '450,000',
		totalShares: '450,000',
		apy: '5.2%',
		status: 'Active',
		createdAt: '2024-01-15',
		actions: 'actions',
	},
	'0xVault2345678901234567890123456789012345678901': {
		address: '0xVault2345678901234567890123456789012345678901' as Address,
		name: 'BAYC Vault #2',
		totalAssets: '380,000',
		totalShares: '380,000',
		apy: '4.8%',
		status: 'Active',
		createdAt: '2024-01-20',
		actions: 'actions',
	},
	'0xVault3456789012345678901234567890123456789012': {
		address: '0xVault3456789012345678901234567890123456789012' as Address,
		name: 'BAYC Vault #3',
		totalAssets: '420,000',
		totalShares: '420,000',
		apy: '5.0%',
		status: 'Active',
		createdAt: '2024-01-25',
		actions: 'actions',
	},
};

const createVaultColumns = (): TableColumnProps<VaultData, VaultTableColumn>[] => [
	{
		key: 'name',
		label: 'Vault',
		width: '25%',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					flexDirection: 'column',
					padding: '0 12px',
					justifyContent: 'center',
				}}>
				<div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: '500', color: '#18171E' }}>
					{data.name}
				</div>
				<div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#6B7280' }}>
					{data.address.slice(0, 8)}...{data.address.slice(-6)}
				</div>
			</div>
		),
	},
	{
		key: 'totalAssets',
		label: 'Total Assets',
		width: '15%',
		align: 'right',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					padding: '0 12px',
				}}>
				<div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: '500', color: '#18171E' }}>
					${data.totalAssets}
				</div>
			</div>
		),
	},
	{
		key: 'totalShares',
		label: 'Total Shares',
		width: '15%',
		align: 'right',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					padding: '0 12px',
				}}>
				<div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: '500', color: '#18171E' }}>
					{data.totalShares}
				</div>
			</div>
		),
	},
	{
		key: 'apy',
		label: 'APY',
		width: '10%',
		align: 'right',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					padding: '0 12px',
				}}>
				<div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: '500', color: '#18171E' }}>
					{data.apy}
				</div>
			</div>
		),
	},
	{
		key: 'status',
		label: 'Status',
		width: '15%',
		align: 'center',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '0 12px',
				}}>
				<Badge variant={data.status === 'Active' ? 'success' : 'neutral'}>{data.status}</Badge>
			</div>
		),
	},
	{
		key: 'actions',
		label: '',
		width: '20%',
		align: 'right',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					padding: '0 12px',
					gap: '8px',
				}}>
				<Button
					variant="ghost"
					size="medium"
					onClick={() => {
						// TODO: Navigate to vault detail page
						console.log('View vault:', data.address);
					}}>
					View
				</Button>
				<Button
					variant="ghost"
					size="medium"
					onClick={() => {
						// TODO: Manage vault
						console.log('Manage vault:', data.address);
					}}>
					Manage
				</Button>
			</div>
		),
	},
];

const VaultInfoSectionComponent: FC<VaultInfoSectionProps> = ({ collectionData }) => {
	const vaultColumns = useMemo(() => createVaultColumns(), []);

	const vaultTableData: TableData<VaultData>[] = useMemo(() => {
		return collectionData.vaults.map((vaultAddress) => {
			const vaultData = mockVaultData[vaultAddress];
			return (
				vaultData || {
					address: vaultAddress,
					name: `Vault ${vaultAddress.slice(0, 8)}`,
					totalAssets: '0',
					totalShares: '0',
					apy: '0%',
					status: 'Active' as const,
					createdAt: 'Unknown',
					actions: 'actions',
				}
			);
		});
	}, [collectionData.vaults]);

	return (
		<Card>
			<div className={css.container}>
				<SectionHeader title="Vault Information" />

				<div className={css.tableContainer}>
					<Table data={vaultTableData} columns={vaultColumns} columnHeight="72px" columnWidth="120px" />
				</div>
			</div>
		</Card>
	);
};

export const VaultInfoSection = typedMemo(VaultInfoSectionComponent);
