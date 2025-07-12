export const COMPTROLLER_ABI = [
	{
		inputs: [],
		name: 'getAllMarkets',
		outputs: [
			{
				internalType: 'contract CToken[]',
				name: '',
				type: 'address[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		name: 'markets',
		outputs: [
			{
				internalType: 'bool',
				name: 'isListed',
				type: 'bool',
			},
			{
				internalType: 'uint256',
				name: 'collateralFactorMantissa',
				type: 'uint256',
			},
			{
				internalType: 'bool',
				name: 'isComped',
				type: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'account',
				type: 'address',
			},
		],
		name: 'getAssetsIn',
		outputs: [
			{
				internalType: 'contract CToken[]',
				name: '',
				type: 'address[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'account',
				type: 'address',
			},
		],
		name: 'getAccountLiquidity',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
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
		name: 'oracle',
		outputs: [
			{
				name: '',
				type: 'address',
				internalType: 'contract PriceOracle',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address[]',
				name: 'cTokens',
				type: 'address[]',
			},
		],
		name: 'enterMarkets',
		outputs: [
			{
				internalType: 'uint256[]',
				name: '',
				type: 'uint256[]',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'cTokenAddress',
				type: 'address',
			},
		],
		name: 'exitMarket',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
] as const;
