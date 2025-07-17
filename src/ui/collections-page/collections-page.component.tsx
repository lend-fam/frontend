import { type FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Address } from 'viem';
import { Layout } from '../layout/layout.component';
import { Table, type TableColumnProps, type TableData } from '../../ui-kit/components/table/table.component';
import { Button } from '../../ui-kit/components/button/button.component';
import { LoadingState } from '../../ui-kit/components/loading-state/loading-state.component';
import { EmptyState } from '../../ui-kit/components/empty-state/empty-state.component';
import { Badge } from '../../ui-kit/components/badge/badge.component';
import { typedMemo } from '../../ui-kit/utils/typed-memo.utils';

import css from './collections-page.module.css';
import tableCss from './theme/table.module.css';

// Collection data structure based on ICollectionRegistry interface
type CollectionData = {
	collectionAddress: Address;
	collectionName: string;
	collectionType: 'ERC721' | 'ERC1155';
	yieldSharePercentage: number;
	weightFunctionType: 'LINEAR' | 'EXPONENTIAL';
	parameters: string;
	vaultCount: number;
	totalVaults: string;
	status: 'Active' | 'Inactive';
	actions: string;
};

type CollectionsTableColumn =
	| 'collectionName'
	| 'collectionType'
	| 'yieldSharePercentage'
	| 'weightFunctionType'
	| 'parameters'
	| 'vaultCount'
	| 'status'
	| 'actions';

// Collection status component
const CollectionStatusComponent: FC<{ status: string }> = ({ status }) => {
	const variant = status === 'Active' ? 'success' : 'neutral';
	return <Badge variant={variant}>{status}</Badge>;
};

// Collection type badge component
const CollectionTypeBadge: FC<{ type: string }> = ({ type }) => {
	return (
		<Badge variant="info" size="small">
			{type}
		</Badge>
	);
};

// Weight function parameters component
const WeightFunctionParams: FC<{ type: string; parameters: string }> = ({ type, parameters }) => {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
			<div style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '500', color: '#18171E' }}>{type}</div>
			<div style={{ fontFamily: 'Inter', fontSize: '11px', color: '#6B7280' }}>{parameters}</div>
		</div>
	);
};

const createCollectionsColumns = (
	navigate: (path: string) => void,
): TableColumnProps<CollectionData, CollectionsTableColumn>[] => [
	{
		key: 'collectionName',
		label: 'Collection',
		width: '20%',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					flexDirection: 'column',
					padding: '0 12px',
					justifyContent: 'center',
					cursor: 'pointer',
				}}
				onClick={() => navigate(`/collections/${data.collectionAddress}`)}>
				<div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: '600', color: '#18171E' }}>
					{data.collectionName}
				</div>
				<div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#6B7280' }}>
					{data.collectionAddress.slice(0, 8)}...{data.collectionAddress.slice(-6)}
				</div>
			</div>
		),
	},
	{
		key: 'collectionType',
		label: 'Type',
		width: '10%',
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
				<CollectionTypeBadge type={data.collectionType} />
			</div>
		),
	},
	{
		key: 'yieldSharePercentage',
		label: 'Yield Share',
		width: '12%',
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
				<div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: '600', color: '#18171E' }}>
					{data.yieldSharePercentage}%
				</div>
			</div>
		),
	},
	{
		key: 'weightFunctionType',
		label: 'Weight Function',
		width: '15%',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					padding: '0 12px',
				}}>
				<WeightFunctionParams type={data.weightFunctionType} parameters={data.parameters} />
			</div>
		),
	},
	{
		key: 'vaultCount',
		label: 'Vaults',
		width: '10%',
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
				<div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: '600', color: '#18171E' }}>
					{data.vaultCount}
				</div>
			</div>
		),
	},
	{
		key: 'status',
		label: 'Status',
		width: '10%',
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
				<CollectionStatusComponent status={data.status} />
			</div>
		),
	},
	{
		key: 'actions',
		label: '',
		width: '23%',
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
					onClick={() => navigate(`/collections/${data.collectionAddress}`)}>
					View Details
				</Button>
				<Button
					variant="ghost"
					size="medium"
					onClick={() => navigate(`/collections/${data.collectionAddress}/manage`)}>
					Manage
				</Button>
			</div>
		),
	},
];

const CollectionsPageComponent: FC = () => {
	const navigate = useNavigate();

	// TODO: Replace with actual data from collection registry contract
	const collectionsData: TableData<CollectionData>[] = useMemo(
		() => [
			{
				collectionAddress: '0x1234567890123456789012345678901234567890' as Address,
				collectionName: 'Bored Ape Yacht Club',
				collectionType: 'ERC721',
				yieldSharePercentage: 25,
				weightFunctionType: 'LINEAR',
				parameters: 'p1: 100, p2: 0',
				vaultCount: 3,
				totalVaults: '3 vaults',
				status: 'Active',
				actions: 'actions',
			},
			{
				collectionAddress: '0x2345678901234567890123456789012345678901' as Address,
				collectionName: 'Mutant Ape Yacht Club',
				collectionType: 'ERC721',
				yieldSharePercentage: 20,
				weightFunctionType: 'EXPONENTIAL',
				parameters: 'p1: 50, p2: 2',
				vaultCount: 2,
				totalVaults: '2 vaults',
				status: 'Active',
				actions: 'actions',
			},
			{
				collectionAddress: '0x3456789012345678901234567890123456789012' as Address,
				collectionName: 'Otherdeeds for Otherside',
				collectionType: 'ERC721',
				yieldSharePercentage: 15,
				weightFunctionType: 'LINEAR',
				parameters: 'p1: 75, p2: 0',
				vaultCount: 1,
				totalVaults: '1 vault',
				status: 'Inactive',
				actions: 'actions',
			},
			{
				collectionAddress: '0x4567890123456789012345678901234567890123' as Address,
				collectionName: 'ApeCoin DAO NFT',
				collectionType: 'ERC1155',
				yieldSharePercentage: 30,
				weightFunctionType: 'EXPONENTIAL',
				parameters: 'p1: 25, p2: 3',
				vaultCount: 4,
				totalVaults: '4 vaults',
				status: 'Active',
				actions: 'actions',
			},
		],
		[],
	);

	const collectionsColumns = useMemo(() => createCollectionsColumns(navigate), [navigate]);

	const isLoading = false; // TODO: Replace with actual loading state
	const isEmpty = collectionsData.length === 0;

	if (isLoading) {
		return (
			<div className={css.container}>
				<Layout>
					<LoadingState title="Loading Collections" message="Fetching collection data from blockchain..." />
				</Layout>
			</div>
		);
	}

	if (isEmpty) {
		return (
			<div className={css.container}>
				<Layout>
					<EmptyState message="No NFT collections have been registered yet. Collections need to be registered to participate in yield distribution." />
				</Layout>
			</div>
		);
	}

	return (
		<div className={css.container}>
			<Layout>
				<div className={css.header}>
					<h1 className={css.title}>Collections</h1>
					<p className={css.subtitle}>Registered NFT collections and their yield distribution parameters</p>
				</div>
				<div className={css.tableContainer}>
					<p className={css.label}>All Collections</p>
					<Table
						data={collectionsData}
						columns={collectionsColumns}
						columnHeight="72px"
						columnWidth="120px"
						theme={tableCss}
					/>
				</div>
			</Layout>
		</div>
	);
};

export const CollectionsPage = typedMemo(CollectionsPageComponent);
