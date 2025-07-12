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
] as const;
