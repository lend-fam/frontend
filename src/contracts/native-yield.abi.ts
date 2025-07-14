export const NATIVE_YIELD_ABI = [
	{
		inputs: [{ name: 'account', type: 'address' }],
		name: 'getBalance',
		outputs: [{ name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ name: 'account', type: 'address' }],
		name: 'getCode',
		outputs: [{ name: '', type: 'bytes' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ name: 'account', type: 'address' }],
		name: 'getBalanceValues',
		outputs: [
			{ name: 'fixed', type: 'uint256' },
			{ name: 'shares', type: 'uint256' },
			{ name: 'debt', type: 'uint256' },
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ name: 'account', type: 'address' }],
		name: 'getYieldConfiguration',
		outputs: [{ name: '', type: 'uint8' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ name: 'account', type: 'address' }],
		name: 'getDelegate',
		outputs: [{ name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'configureAutomaticYield',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'configureVoidYield',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ name: 'account', type: 'address' }],
		name: 'configureDelegateYield',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
] as const;

export const ARB_OWNER_PUBLIC_ABI = [
	{
		inputs: [{ name: 'addr', type: 'address' }],
		name: 'isChainOwner',
		outputs: [{ name: '', type: 'bool' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'getAllChainOwners',
		outputs: [{ name: '', type: 'address[]' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'getNetworkFeeAccount',
		outputs: [{ name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'getInfraFeeAccount',
		outputs: [{ name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'getSharePrice',
		outputs: [{ name: '', type: 'uint64' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'getShareCount',
		outputs: [{ name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'getApy',
		outputs: [{ name: '', type: 'uint64' }],
		stateMutability: 'view',
		type: 'function',
	},
] as const;

export const YIELD_MODES = {
	AUTOMATIC: 0,
	CLAIMABLE: 1,
	VOID: 2,
} as const;

export const ARB_INFO_ADDRESS = '0x0000000000000000000000000000000000000065' as const;
export const ARB_OWNER_PUBLIC_ADDRESS = '0x000000000000000000000000000000000000006b' as const;

export type YieldMode = 'automatic' | 'claimable' | 'void';

export function parseYieldMode(config: number): YieldMode {
	switch (config) {
		case YIELD_MODES.AUTOMATIC:
			return 'automatic';
		case YIELD_MODES.CLAIMABLE:
			return 'claimable';
		case YIELD_MODES.VOID:
			return 'void';
		default:
			return 'void';
	}
}
