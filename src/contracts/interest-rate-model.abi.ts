export const INTEREST_RATE_MODEL_ABI = [
	// Base functions - present in all models
	{
		inputs: [],
		name: 'baseRatePerBlock',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'multiplierPerBlock',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'blocksPerYear',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	// Jump rate model functions - only present in JumpRateModel variants
	{
		inputs: [],
		name: 'jumpMultiplierPerBlock',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'kink',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	// DAI model specific functions
	{
		inputs: [],
		name: 'gapPerBlock',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	// JumpRateModelV2 functions
	{
		inputs: [],
		name: 'owner',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'cash',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'borrows',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'reserves',
				type: 'uint256',
			},
		],
		name: 'getBorrowRate',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'cash',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'borrows',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'reserves',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'reserveFactorMantissa',
				type: 'uint256',
			},
		],
		name: 'getSupplyRate',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
] as const;
