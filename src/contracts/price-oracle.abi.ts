export const PRICE_ORACLE_ABI = [
	{
		inputs: [],
		name: 'isPriceOracle',
		outputs: [
			{
				name: '',
				type: 'bool',
				internalType: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				name: 'cToken',
				type: 'address',
				internalType: 'contract CToken',
			},
		],
		name: 'getUnderlyingPrice',
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	// PythPriceOracle specific functions
	{
		inputs: [],
		name: 'pyth',
		outputs: [
			{
				name: '',
				type: 'address',
				internalType: 'contract IPyth',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'admin',
		outputs: [
			{
				name: '',
				type: 'address',
				internalType: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'maxPriceAge',
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				name: 'asset',
				type: 'address',
				internalType: 'address',
			},
		],
		name: 'assetToPriceFeedId',
		outputs: [
			{
				name: '',
				type: 'bytes32',
				internalType: 'bytes32',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				name: 'asset',
				type: 'address',
				internalType: 'address',
			},
		],
		name: 'fallbackPrices',
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				name: 'asset',
				type: 'address',
				internalType: 'address',
			},
		],
		name: 'useFallbackPrice',
		outputs: [
			{
				name: '',
				type: 'bool',
				internalType: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				name: 'priceFeedId',
				type: 'bytes32',
				internalType: 'bytes32',
			},
		],
		name: 'canGetPythPrice',
		outputs: [
			{
				name: '',
				type: 'bool',
				internalType: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				name: 'asset',
				type: 'address',
				internalType: 'address',
			},
		],
		name: 'assetPrices',
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
] as const;
