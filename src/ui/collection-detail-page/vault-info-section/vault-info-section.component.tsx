import { type FC, useMemo } from 'react';
import { Card } from '../../../ui-kit/components/card/card.component';
import { SectionHeader } from '../../../ui-kit/components/section-header/section-header.component';
import { Table, type TableColumnProps, type TableData } from '../../../ui-kit/components/table/table.component';
import { Button } from '../../../ui-kit/components/button/button.component';
import { Badge } from '../../../ui-kit/components/badge/badge.component';
import { typedMemo } from '../../../ui-kit/utils/typed-memo.utils';
import type { CollectionDetailData, VaultInfo } from '../collection-detail-page.component';

import css from './vault-info-section.module.css';

interface VaultInfoSectionProps {
	collectionData: CollectionDetailData;
}

const createVaultColumns = (): TableColumnProps<VaultInfo, string>[] => [
	{
		key: 'name',
		label: 'Vault',
		width: '50%',
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
		width: '25%',
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
		width: '10%',
		align: 'right',
		cellRenderer: ({ style }) => (
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
					}}>
					View
				</Button>
			</div>
		),
	},
];

const VaultInfoSectionComponent: FC<VaultInfoSectionProps> = ({ collectionData }) => {
	const vaultColumns = useMemo(() => createVaultColumns(), []);

	const vaultTableData: TableData<VaultInfo>[] = useMemo(() => {
		return collectionData.vaults;
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
