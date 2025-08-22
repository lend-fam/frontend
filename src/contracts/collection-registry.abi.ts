export const COLLECTION_REGISTRY_ABI = [
	{
		type: 'function',
		name: 'allCollections',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'address[]',
				internalType: 'address[]',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'authorizeAddressForCollection',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
			{
				name: 'authorizedAddress',
				type: 'address',
				internalType: 'address',
			},
		],
		outputs: [],
		stateMutability: 'nonpayable',
	},
	{
		type: 'function',
		name: 'getActiveCollectionCount',
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
		name: 'getAllActiveCollections',
		inputs: [],
		outputs: [
			{
				name: 'collectionIds',
				type: 'uint256[]',
				internalType: 'uint256[]',
			},
			{
				name: 'summaries',
				type: 'tuple[]',
				internalType: 'struct ICollectionRegistry.CollectionSummary[]',
				components: [
					{
						name: 'collectionId',
						type: 'uint256',
						internalType: 'uint256',
					},
					{
						name: 'originalAddress',
						type: 'address',
						internalType: 'address',
					},
					{
						name: 'yieldSharePercentage',
						type: 'uint16',
						internalType: 'uint16',
					},
					{
						name: 'isActive',
						type: 'bool',
						internalType: 'bool',
					},
				],
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getAllCollectionIds',
		inputs: [],
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
		name: 'getAuthorizedAddressesForCollection',
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
				type: 'address[]',
				internalType: 'address[]',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getCollection',
		inputs: [
			{
				name: 'collection',
				type: 'address',
				internalType: 'address',
			},
		],
		outputs: [
			{
				name: '',
				type: 'tuple',
				internalType: 'struct ICollectionRegistry.Collection',
				components: [
					{
						name: 'collectionAddress',
						type: 'address',
						internalType: 'address',
					},
					{
						name: 'collectionType',
						type: 'uint8',
						internalType: 'enum ICollectionRegistry.CollectionType',
					},
					{
						name: 'weightFunction',
						type: 'tuple',
						internalType: 'struct ICollectionRegistry.WeightFunction',
						components: [
							{
								name: 'fnType',
								type: 'uint8',
								internalType: 'enum ICollectionRegistry.WeightFunctionType',
							},
							{
								name: 'p1',
								type: 'int256',
								internalType: 'int256',
							},
							{
								name: 'p2',
								type: 'int256',
								internalType: 'int256',
							},
						],
					},
					{
						name: 'yieldSharePercentage',
						type: 'uint16',
						internalType: 'uint16',
					},
				],
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getCollectionAuthInfo',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
			{
				name: 'userAddress',
				type: 'address',
				internalType: 'address',
			},
		],
		outputs: [
			{
				name: 'authInfo',
				type: 'tuple',
				internalType: 'struct ICollectionRegistry.CollectionAuthInfo',
				components: [
					{
						name: 'details',
						type: 'tuple',
						internalType: 'struct ICollectionRegistry.CollectionDetails',
						components: [
							{
								name: 'collectionId',
								type: 'uint256',
								internalType: 'uint256',
							},
							{
								name: 'originalAddress',
								type: 'address',
								internalType: 'address',
							},
							{
								name: 'sourceChainId',
								type: 'uint256',
								internalType: 'uint256',
							},
							{
								name: 'collectionType',
								type: 'uint8',
								internalType: 'enum ICollectionRegistry.CollectionType',
							},
							{
								name: 'weightFunction',
								type: 'tuple',
								internalType: 'struct ICollectionRegistry.WeightFunction',
								components: [
									{
										name: 'fnType',
										type: 'uint8',
										internalType: 'enum ICollectionRegistry.WeightFunctionType',
									},
									{
										name: 'p1',
										type: 'int256',
										internalType: 'int256',
									},
									{
										name: 'p2',
										type: 'int256',
										internalType: 'int256',
									},
								],
							},
							{
								name: 'yieldSharePercentage',
								type: 'uint16',
								internalType: 'uint16',
							},
							{
								name: 'registeredAt',
								type: 'uint256',
								internalType: 'uint256',
							},
							{
								name: 'isActive',
								type: 'bool',
								internalType: 'bool',
							},
							{
								name: 'isRemoved',
								type: 'bool',
								internalType: 'bool',
							},
						],
					},
					{
						name: 'authorizedAddresses',
						type: 'address[]',
						internalType: 'address[]',
					},
					{
						name: 'isUserAuthorized',
						type: 'bool',
						internalType: 'bool',
					},
				],
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getCollectionDetails',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		outputs: [
			{
				name: 'details',
				type: 'tuple',
				internalType: 'struct ICollectionRegistry.CollectionDetails',
				components: [
					{
						name: 'collectionId',
						type: 'uint256',
						internalType: 'uint256',
					},
					{
						name: 'originalAddress',
						type: 'address',
						internalType: 'address',
					},
					{
						name: 'sourceChainId',
						type: 'uint256',
						internalType: 'uint256',
					},
					{
						name: 'collectionType',
						type: 'uint8',
						internalType: 'enum ICollectionRegistry.CollectionType',
					},
					{
						name: 'weightFunction',
						type: 'tuple',
						internalType: 'struct ICollectionRegistry.WeightFunction',
						components: [
							{
								name: 'fnType',
								type: 'uint8',
								internalType: 'enum ICollectionRegistry.WeightFunctionType',
							},
							{
								name: 'p1',
								type: 'int256',
								internalType: 'int256',
							},
							{
								name: 'p2',
								type: 'int256',
								internalType: 'int256',
							},
						],
					},
					{
						name: 'yieldSharePercentage',
						type: 'uint16',
						internalType: 'uint16',
					},
					{
						name: 'registeredAt',
						type: 'uint256',
						internalType: 'uint256',
					},
					{
						name: 'isActive',
						type: 'bool',
						internalType: 'bool',
					},
					{
						name: 'isRemoved',
						type: 'bool',
						internalType: 'bool',
					},
				],
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getCollectionId',
		inputs: [
			{
				name: 'originalAddress',
				type: 'address',
				internalType: 'address',
			},
			{
				name: 'sourceChainId',
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
		name: 'getCollectionIdsBatch',
		inputs: [
			{
				name: 'addresses',
				type: 'address[]',
				internalType: 'address[]',
			},
			{
				name: 'chainIds',
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
		name: 'getCollectionInfo',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		outputs: [
			{
				name: 'originalAddress',
				type: 'address',
				internalType: 'address',
			},
			{
				name: 'sourceChainId',
				type: 'uint256',
				internalType: 'uint256',
			},
			{
				name: 'collectionType',
				type: 'uint8',
				internalType: 'enum ICollectionRegistry.CollectionType',
			},
			{
				name: 'weightFunction',
				type: 'tuple',
				internalType: 'struct ICollectionRegistry.WeightFunction',
				components: [
					{
						name: 'fnType',
						type: 'uint8',
						internalType: 'enum ICollectionRegistry.WeightFunctionType',
					},
					{
						name: 'p1',
						type: 'int256',
						internalType: 'int256',
					},
					{
						name: 'p2',
						type: 'int256',
						internalType: 'int256',
					},
				],
			},
			{
				name: 'yieldSharePercentage',
				type: 'uint16',
				internalType: 'uint16',
			},
			{
				name: 'registeredAt',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getCollectionSummary',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		outputs: [
			{
				name: 'summary',
				type: 'tuple',
				internalType: 'struct ICollectionRegistry.CollectionSummary',
				components: [
					{
						name: 'collectionId',
						type: 'uint256',
						internalType: 'uint256',
					},
					{
						name: 'originalAddress',
						type: 'address',
						internalType: 'address',
					},
					{
						name: 'yieldSharePercentage',
						type: 'uint16',
						internalType: 'uint16',
					},
					{
						name: 'isActive',
						type: 'bool',
						internalType: 'bool',
					},
				],
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getCollectionsByIds',
		inputs: [
			{
				name: 'collectionIds',
				type: 'uint256[]',
				internalType: 'uint256[]',
			},
		],
		outputs: [
			{
				name: 'originalAddresses',
				type: 'address[]',
				internalType: 'address[]',
			},
			{
				name: 'sourceChainIds',
				type: 'uint256[]',
				internalType: 'uint256[]',
			},
			{
				name: 'collectionTypes',
				type: 'uint8[]',
				internalType: 'enum ICollectionRegistry.CollectionType[]',
			},
			{
				name: 'weightFunctions',
				type: 'tuple[]',
				internalType: 'struct ICollectionRegistry.WeightFunction[]',
				components: [
					{
						name: 'fnType',
						type: 'uint8',
						internalType: 'enum ICollectionRegistry.WeightFunctionType',
					},
					{
						name: 'p1',
						type: 'int256',
						internalType: 'int256',
					},
					{
						name: 'p2',
						type: 'int256',
						internalType: 'int256',
					},
				],
			},
			{
				name: 'yieldSharePercentages',
				type: 'uint16[]',
				internalType: 'uint16[]',
			},
			{
				name: 'registeredAts',
				type: 'uint256[]',
				internalType: 'uint256[]',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'isAuthorizedBatch',
		inputs: [
			{
				name: 'collectionIds',
				type: 'uint256[]',
				internalType: 'uint256[]',
			},
			{
				name: 'addr',
				type: 'address',
				internalType: 'address',
			},
		],
		outputs: [
			{
				name: '',
				type: 'bool[]',
				internalType: 'bool[]',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'isAuthorizedForCollection',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
			{
				name: 'addr',
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
		name: 'isRegistered',
		inputs: [
			{
				name: 'collection',
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
		name: 'isRegisteredById',
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
				type: 'bool',
				internalType: 'bool',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'registerCollection',
		inputs: [
			{
				name: 'originalAddress',
				type: 'address',
				internalType: 'address',
			},
			{
				name: 'sourceChainId',
				type: 'uint256',
				internalType: 'uint256',
			},
			{
				name: 'collectionType',
				type: 'uint8',
				internalType: 'enum ICollectionRegistry.CollectionType',
			},
			{
				name: 'weightFunction',
				type: 'tuple',
				internalType: 'struct ICollectionRegistry.WeightFunction',
				components: [
					{
						name: 'fnType',
						type: 'uint8',
						internalType: 'enum ICollectionRegistry.WeightFunctionType',
					},
					{
						name: 'p1',
						type: 'int256',
						internalType: 'int256',
					},
					{
						name: 'p2',
						type: 'int256',
						internalType: 'int256',
					},
				],
			},
			{
				name: 'yieldSharePercentage',
				type: 'uint16',
				internalType: 'uint16',
			},
		],
		outputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'nonpayable',
	},
	{
		type: 'function',
		name: 'revokeAddressForCollection',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
			{
				name: 'authorizedAddress',
				type: 'address',
				internalType: 'address',
			},
		],
		outputs: [],
		stateMutability: 'nonpayable',
	},
	{
		type: 'function',
		name: 'setWeightFunction',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
			{
				name: 'weightFunction',
				type: 'tuple',
				internalType: 'struct ICollectionRegistry.WeightFunction',
				components: [
					{
						name: 'fnType',
						type: 'uint8',
						internalType: 'enum ICollectionRegistry.WeightFunctionType',
					},
					{
						name: 'p1',
						type: 'int256',
						internalType: 'int256',
					},
					{
						name: 'p2',
						type: 'int256',
						internalType: 'int256',
					},
				],
			},
		],
		outputs: [],
		stateMutability: 'nonpayable',
	},
	{
		type: 'function',
		name: 'setYieldShare',
		inputs: [
			{
				name: 'collectionId',
				type: 'uint256',
				internalType: 'uint256',
			},
			{
				name: 'share',
				type: 'uint16',
				internalType: 'uint16',
			},
		],
		outputs: [],
		stateMutability: 'nonpayable',
	},
	{
		type: 'function',
		name: 'totalYieldBps',
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
] as const;
