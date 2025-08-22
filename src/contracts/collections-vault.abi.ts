export const COLLECTIONS_VAULT_ABI = [
	{
		type: 'function',
		name: 'ADMIN_ROLE',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'bytes32',
				internalType: 'bytes32',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'DEBT_SUBSIDIZER_ROLE',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'bytes32',
				internalType: 'bytes32',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'asset',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'address',
				internalType: 'address',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'balanceOf',
		inputs: [
			{
				name: 'account',
				type: 'address',
				internalType: 'address',
			},
			{
				name: 'id',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'balanceOfBatch',
		inputs: [
			{
				name: 'accounts',
				type: 'address[]',
				internalType: 'address[]',
			},
			{
				name: 'ids',
				type: 'uint256[]',
				internalType: 'uint256[]',
			},
		],
		outputs: [
			{
				name: '',
				type: 'uint256[]',
				internalType: 'uint256[]',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'convertToAssets',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
			{
				name: 'shares',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		outputs: [
			{
				name: 'assets',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'convertToShares',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
			{
				name: 'assets',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		outputs: [
			{
				name: 'shares',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'decimals',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'uint8',
				internalType: 'uint8',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getCollectionPerformanceScore',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getCollectionTotalBorrowVolume',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getCollectionTotalYieldGenerated',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getCurrentEpochYield',
		inputs: [
			{
				name: 'includeNonShared',
				type: 'bool',
				internalType: 'bool',
			},
		],
		outputs: [
			{
				name: 'availableYield',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getRemainingCumulativeYield',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getTotalAvailableYield',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'isCollectionOperator',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
			{
				name: 'operator',
				type: 'address',
				internalType: 'address',
			},
		],
		outputs: [
			{
				name: '',
				type: 'bool',
				internalType: 'bool',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'totalAssets',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'totalAssetsDeposited',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'totalCollectionYieldShareBps',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'uint16',
				internalType: 'uint16',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'totalShares',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'totalYieldAllocated',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'totalYieldReserved',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
] as const;
