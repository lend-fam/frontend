export const VAULT_REGISTRY_ABI = [
	{
		type: 'function',
		name: 'getSupportedVaultCount',
		inputs: [],
		outputs: [
			{
				name: 'count',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getAllSupportedVaults',
		inputs: [],
		outputs: [
			{
				name: 'vaults',
				type: 'address[]',
				internalType: 'address[]',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getSupportedVaults',
		inputs: [
			{
				name: 'offset',
				type: 'uint256',
				internalType: 'uint256',
			},
			{
				name: 'limit',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		outputs: [
			{
				name: 'vaults',
				type: 'address[]',
				internalType: 'address[]',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getVaultInfo',
		inputs: [
			{
				name: 'vault',
				type: 'address',
				internalType: 'address',
			},
		],
		outputs: [
			{
				name: 'info',
				type: 'tuple',
				internalType: 'struct VaultRegistry.VaultInfo',
				components: [
					{
						name: 'vault',
						type: 'address',
						internalType: 'address',
					},
					{
						name: 'asset',
						type: 'address',
						internalType: 'address',
					},
					{
						name: 'cToken',
						type: 'address',
						internalType: 'address',
					},
					{
						name: 'lendingManager',
						type: 'address',
						internalType: 'address',
					},
					{
						name: 'name',
						type: 'string',
						internalType: 'string',
					},
					{
						name: 'symbol',
						type: 'string',
						internalType: 'string',
					},
					{
						name: 'active',
						type: 'bool',
						internalType: 'bool',
					},
					{
						name: 'registeredAt',
						type: 'uint256',
						internalType: 'uint256',
					},
				],
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'isVaultSupported',
		inputs: [
			{
				name: 'vault',
				type: 'address',
				internalType: 'address',
			},
		],
		outputs: [
			{
				name: 'supported',
				type: 'bool',
				internalType: 'bool',
			},
		],
		stateMutability: 'view',
	},
] as const;
