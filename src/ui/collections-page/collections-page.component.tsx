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
import { useCollectionsPageDataWithFallback } from '../../hooks/use-collections-page-data.hook';

import css from './collections-page.module.css';
import tableCss from './theme/table.module.css';
import SignLinearIcon from '../../assets/svg/Sign_linear.svg?url';
import SignExponentialIcon from '../../assets/svg/Sign_exponential.svg?url';
import UnionIcon from '../../assets/svg/Union.svg?url';

// Utility function to compact address display
const formatCompactAddress = (address: string): string => {
	if (address.length < 10) return address;
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Collection data structure based on ICollectionRegistry interface
type CollectionData = {
	collectionAddress: Address;
	collectionName: string;
	collectionType: 'ERC721' | 'ERC1155';
	yieldSharePercentage: number;
	userOwnership?: 'owned' | 'not_owned' | 'unknown';
	nftMultiplier?: number | null;
	weightFunction?: {
		type: 'LINEAR' | 'EXPONENTIAL';
		key: string;
		label: string;
		description?: string;
	};
	vaultCount: number;
	totalVaults: string;
	status: 'Active' | 'Inactive';
	actions: string;
};

type CollectionsTableColumn =
	| 'collectionName'
	| 'userOwnership'
	| 'collectionType'
	| 'yieldSharePercentage'
	| 'nftMultiplier'
	| 'weightFunction'
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

// Heart ownership indicator component
const HeartOwnershipIndicator: FC<{ ownership?: 'owned' | 'not_owned' | 'unknown' }> = ({ ownership }) => {
	const heartIcon = ownership === 'owned' ? '♥' : '♡';
	const color = ownership === 'owned' ? '#FF6B6B' : '#D1D5DB';

	return (
		<div
			className={ownership !== 'unknown' ? tableCss.heartIcon : ''}
			style={{
				fontSize: '18px',
				color,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				cursor: ownership !== 'unknown' ? 'pointer' : 'default',
			}}>
			{ownership === 'unknown' ? '—' : heartIcon}
		</div>
	);
};

// NFT Multiplier display component
const NFTMultiplierDisplay: FC<{ multiplier?: number | null }> = ({ multiplier }) => {
	return (
		<div className={tableCss.multiplierCell} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
			<span
				style={{
					fontFamily: 'Inter',
					fontSize: '14px',
					fontWeight: '600',
					color: '#18171E',
				}}>
				{multiplier ? `${multiplier}x` : '—'}
			</span>
			<span
				className={tableCss.infoIcon}
				style={{ fontSize: '12px', color: '#9CA3AF' }}
				title="Your current NFT multiplier based on owned tokens in this collection">
				ℹ
			</span>
		</div>
	);
};

// Weight function display component with chart icon
const WeightFunctionDisplay: FC<{ weightFunction?: CollectionData['weightFunction'] }> = ({ weightFunction }) => {
	const type = weightFunction?.type || 'LINEAR';
	const iconSrc = type === 'EXPONENTIAL' ? SignExponentialIcon : SignLinearIcon;

	return (
		<div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
			<img
				src={iconSrc}
				alt={`${type === 'EXPONENTIAL' ? 'Exponential' : 'Linear'} weight function`}
				className={tableCss.chartIcon}
				style={{ width: '18px', height: '18px' }}
			/>
			<img
				src={UnionIcon}
				alt="More information"
				className={tableCss.infoIcon}
				style={{ width: '16px', height: '16px', cursor: 'help' }}
				title={
					weightFunction?.description ||
					`${type === 'EXPONENTIAL' ? 'Exponential' : 'Linear'} weight function: determines how NFT count affects user subsidies`
				}
			/>
		</div>
	);
};

const createCollectionsColumns = (
	navigate: (path: string) => void,
): TableColumnProps<CollectionData, CollectionsTableColumn>[] => [
	{
		key: 'collectionName',
		label: 'Collection',
		width: '18%',
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
					{formatCompactAddress(data.collectionAddress)}
				</div>
			</div>
		),
	},
	{
		key: 'userOwnership',
		label: 'My',
		width: '6%',
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
				<HeartOwnershipIndicator ownership={data.userOwnership} />
			</div>
		),
	},
	{
		key: 'collectionType',
		label: 'Type',
		width: '8%',
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
					padding: '0 16px',
				}}>
				<div
					style={{
						fontFamily: 'Inter',
						fontSize: '14px',
						fontWeight: '600',
						color: '#18171E',
						textAlign: 'right',
					}}>
					{data.yieldSharePercentage}%
				</div>
			</div>
		),
	},
	{
		key: 'nftMultiplier',
		label: 'My Multiplier',
		width: '12%',
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
				<NFTMultiplierDisplay multiplier={data.nftMultiplier} />
			</div>
		),
	},
	{
		key: 'weightFunction',
		label: 'Weight Function',
		width: '14%',
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
				<WeightFunctionDisplay weightFunction={data.weightFunction} />
			</div>
		),
	},
	{
		key: 'vaultCount',
		label: 'Vaults',
		width: '8%',
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
				<div
					style={{
						fontFamily: 'Inter',
						fontSize: '14px',
						fontWeight: '600',
						color: '#18171E',
						textAlign: 'center',
					}}>
					{data.vaultCount}
				</div>
			</div>
		),
	},
	{
		key: 'status',
		label: 'Status',
		width: '8%',
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
		width: '16%',
		align: 'right',
		cellRenderer: ({ data, style }) => (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					padding: '0 16px',
					gap: '8px',
				}}>
				<Button
					variant="ghost"
					size="medium"
					onClick={() => navigate(`/collections/${data.collectionAddress}`)}>
					Details
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

	// Fetch real collections data from smart contracts and GraphQL
	const {
		collections: collectionsData,
		loading: isLoading,
		error,
		isEmpty,
		hasFallback,
		refetch,
	} = useCollectionsPageDataWithFallback();

	const collectionsColumns = useMemo(() => createCollectionsColumns(navigate), [navigate]);

	// Transform collections data to table format
	const tableData: TableData<CollectionData>[] = useMemo(() => {
		return collectionsData.map((collection) => ({
			...collection,
		}));
	}, [collectionsData]);

	if (isLoading) {
		return (
			<div className={css.container}>
				<Layout>
					<LoadingState title="Loading Collections" message="Fetching collection data from blockchain..." />
				</Layout>
			</div>
		);
	}

	if (error && !hasFallback) {
		return (
			<div className={css.container}>
				<Layout>
					<div style={{ textAlign: 'center' }}>
						<EmptyState message="Failed to load collection data. Please check your connection and try again." />
						<Button variant="primary" onClick={() => refetch()} style={{ marginTop: '16px' }}>
							Retry
						</Button>
					</div>
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
					<p className={css.subtitle}>
						Registered NFT collections and their yield distribution parameters
						{hasFallback && (
							<span style={{ color: '#f59e0b', marginLeft: '8px' }}>⚠️ Using fallback data</span>
						)}
					</p>
				</div>
				<div className={css.tableContainer}>
					<p className={css.label}>All Collections</p>
					<Table
						data={tableData}
						columns={collectionsColumns}
						columnHeight="72px"
						columnWidth="120px"
						theme={tableCss}
					/>
					{error && hasFallback && (
						<div
							style={{
								marginTop: '16px',
								padding: '12px',
								backgroundColor: '#fef3c7',
								borderRadius: '6px',
							}}>
							<p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
								⚠️ Some data may be outdated.{' '}
								<button
									onClick={() => refetch()}
									style={{
										color: '#92400e',
										textDecoration: 'underline',
										background: 'none',
										border: 'none',
										cursor: 'pointer',
									}}>
									Try refreshing
								</button>
							</p>
						</div>
					)}
				</div>
			</Layout>
		</div>
	);
};

export const CollectionsPage = typedMemo(CollectionsPageComponent);
