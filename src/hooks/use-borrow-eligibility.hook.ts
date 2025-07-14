import { useMemo } from 'react';
import { formatUnits } from 'viem';
import type { Address } from 'viem';
import { useAccount, useReadContracts, useChainId } from 'wagmi';
import { useAccountLiquidity } from './use-account-liquidity.hook';
import { COMPTROLLER_ABI } from '../contracts/comptroller.abi';
import { CTOKEN_ABI } from '../contracts/ctoken.abi';
import { getComptrollerAddress } from '../contracts';
import { HEALTH_FACTOR_CONSTANTS } from '../utils/health-factor.utils';

export type BorrowEligibilityReason =
	| 'WALLET_NOT_CONNECTED'
	| 'WRONG_NETWORK'
	| 'MARKET_PAUSED'
	| 'ORACLE_ERROR'
	| 'NO_LIQUIDITY'
	| 'INSUFFICIENT_COLLATERAL'
	| 'ACCOUNT_SHORTFALL'
	| 'NOT_ENTERED_MARKET'
	| 'BORROW_CAP_REACHED'
	| 'AMOUNT_TOO_SMALL'
	| 'HEALTH_FACTOR_TOO_LOW'
	| 'ELIGIBLE';

export interface BorrowEligibilityResult {
	canBorrow: boolean;
	reason: BorrowEligibilityReason;
	buttonText: string;
	details: {
		availableLiquidity?: bigint;
		userBorrowCapacity?: bigint;
		maxBorrowAmount?: bigint;
		currentHealthFactor?: number;
		postBorrowHealthFactor?: number;
		accountLiquidity?: bigint;
		accountShortfall?: bigint;
		marketCash?: bigint;
		borrowCap?: bigint;
		totalBorrows?: bigint;
		isMarketEntered?: boolean;
		isPaused?: boolean;
		minBorrowAmount?: bigint;
		contractError?: bigint;
		errorCode?: number;
	};
}

export interface UseBorrowEligibilityParams {
	marketAddress?: Address;
	borrowAmount?: bigint;
	tokenDecimals?: number;
	tokenSymbol?: string;
}

export function useBorrowEligibility({
	marketAddress,
	borrowAmount = 0n,
	tokenDecimals = 18,
	tokenSymbol = 'TOKEN',
}: UseBorrowEligibilityParams): BorrowEligibilityResult {
	const { address: userAddress, isConnected } = useAccount();
	const chainId = useChainId();
	const {
		data: accountLiquidity,
		error: accountLiquidityError,
		isLoading: isAccountLiquidityLoading,
	} = useAccountLiquidity(userAddress);

	const comptrollerAddress = getComptrollerAddress(chainId);

	// Batch contract reads for efficiency
	const {
		data: contractData,
		error: contractError,
		isLoading: isContractLoading,
	} = useReadContracts({
		contracts: marketAddress
			? [
					// CToken contract calls
					{
						address: marketAddress,
						abi: CTOKEN_ABI,
						functionName: 'getCash',
					},
					{
						address: marketAddress,
						abi: CTOKEN_ABI,
						functionName: 'totalBorrows',
					},
					// Comptroller contract calls
					{
						address: comptrollerAddress,
						abi: COMPTROLLER_ABI,
						functionName: 'markets',
						args: [marketAddress],
					},
					{
						address: comptrollerAddress,
						abi: COMPTROLLER_ABI,
						functionName: 'getAssetsIn',
						args: userAddress ? [userAddress] : undefined,
					},
				]
			: [],
		query: {
			enabled: !!marketAddress && isConnected && !!userAddress,
			staleTime: 5000, // 5 seconds - fresh data for user actions
			refetchInterval: 10000, // Refetch every 10 seconds
			refetchOnWindowFocus: true, // Refetch when user returns to app
		},
	});

	const result = useMemo((): BorrowEligibilityResult => {
		// Initialize default result
		const defaultResult: BorrowEligibilityResult = {
			canBorrow: false,
			reason: 'WALLET_NOT_CONNECTED',
			buttonText: 'Connect Wallet',
			details: {},
		};

		// Check wallet connection (highest priority)
		if (!isConnected || !userAddress) {
			return defaultResult;
		}

		// Check network (high priority)
		if (chainId !== 33139 && chainId !== 33111) {
			return {
				...defaultResult,
				reason: 'WRONG_NETWORK',
				buttonText: 'Wrong Network',
			};
		}

		// Check if market address is provided
		if (!marketAddress) {
			return {
				...defaultResult,
				reason: 'ORACLE_ERROR',
				buttonText: 'Invalid Market',
			};
		}

		// Extract contract data
		const [marketCashResult, totalBorrowsResult, marketInfoResult, userMarketsResult] = contractData || [];

		// Check if contract calls are loading
		if (isContractLoading) {
			return {
				...defaultResult,
				reason: 'ORACLE_ERROR',
				buttonText: 'Loading...',
				details: {},
			};
		}

		// Check if contract calls failed
		if (contractError || !contractData || contractData.length === 0) {
			return {
				...defaultResult,
				reason: 'ORACLE_ERROR',
				buttonText: 'Contract Error',
				details: {},
			};
		}

		const marketCash = marketCashResult?.result as bigint | undefined;
		const totalBorrows = totalBorrowsResult?.result as bigint | undefined;
		const marketInfo = marketInfoResult?.result as [boolean, bigint, boolean] | undefined;
		const userMarkets = userMarketsResult?.result as Address[] | undefined;

		// Process market info
		const isListed = marketInfo?.[0] ?? false;

		// Check if user has entered this market
		const isMarketEntered =
			userMarkets?.some((market) => market.toLowerCase() === marketAddress.toLowerCase()) ?? false;

		// Check if market is listed (high priority)
		if (!isListed) {
			return {
				...defaultResult,
				reason: 'MARKET_PAUSED',
				buttonText: 'Market Not Listed',
				details: { isPaused: true },
			};
		}

		// Check market liquidity (high priority)
		if (marketCash === undefined || marketCash === 0n) {
			return {
				...defaultResult,
				reason: 'NO_LIQUIDITY',
				buttonText: 'No Liquidity',
				details: { marketCash: marketCash || 0n },
			};
		}

		// Process account liquidity
		let accountLiquidityValue = 0n;
		let accountShortfall = 0n;
		let hasAccountLiquidityError = false;

		// Check if account liquidity is loading
		if (isAccountLiquidityLoading) {
			return {
				...defaultResult,
				reason: 'ORACLE_ERROR',
				buttonText: 'Loading...',
				details: { accountLiquidity: accountLiquidityValue },
			};
		}

		// Check if account liquidity call failed
		if (accountLiquidityError || !accountLiquidity) {
			return {
				...defaultResult,
				reason: 'ORACLE_ERROR',
				buttonText: 'Account Error',
				details: { accountLiquidity: accountLiquidityValue },
			};
		}

		const [error, liquidity, shortfall] = accountLiquidity as [bigint, bigint, bigint];
		hasAccountLiquidityError = error !== 0n;
		accountLiquidityValue = liquidity;
		accountShortfall = shortfall;

		// Check for oracle/system errors
		if (hasAccountLiquidityError) {
			// Provide more specific error messages based on error code
			let errorMessage = 'System Error';
			if (error === 13n) {
				errorMessage = 'Price Oracle Error';
			} else if (error === 1n) {
				errorMessage = 'Market Not Listed';
			} else if (error === 2n) {
				errorMessage = 'Price Error';
			} else if (error === 3n) {
				errorMessage = 'Calculation Error';
			}

			return {
				...defaultResult,
				reason: 'ORACLE_ERROR',
				buttonText: errorMessage,
				details: {
					accountLiquidity: accountLiquidityValue,
					contractError: error,
					errorCode: Number(error),
				},
			};
		}

		// Check for account shortfall (negative liquidity)
		if (accountShortfall > 0n) {
			return {
				...defaultResult,
				reason: 'ACCOUNT_SHORTFALL',
				buttonText: 'Insufficient Collateral',
				details: {
					accountShortfall,
					accountLiquidity: accountLiquidityValue,
				},
			};
		}

		// Check if user has entered the market for collateral
		if (isMarketEntered === false) {
			return {
				...defaultResult,
				reason: 'NOT_ENTERED_MARKET',
				buttonText: 'Enter Market First',
				details: { isMarketEntered: false },
			};
		}

		// Check if user has sufficient collateral
		if (accountLiquidityValue === 0n) {
			return {
				...defaultResult,
				reason: 'INSUFFICIENT_COLLATERAL',
				buttonText: 'Insufficient Collateral',
				details: { accountLiquidity: accountLiquidityValue },
			};
		}

		// Calculate available amounts
		const userBorrowCapacity = accountLiquidityValue;
		const availableLiquidity = marketCash;
		const maxBorrowAmount = userBorrowCapacity < availableLiquidity ? userBorrowCapacity : availableLiquidity;

		const effectiveMaxBorrow = maxBorrowAmount;

		// Define minimum borrow amount (0.001 tokens)
		const minBorrowAmount = BigInt(10 ** (tokenDecimals - 3));

		// Check minimum borrow amount
		if (effectiveMaxBorrow < minBorrowAmount) {
			return {
				...defaultResult,
				reason: 'AMOUNT_TOO_SMALL',
				buttonText: `Min ${formatUnits(minBorrowAmount, tokenDecimals)} ${tokenSymbol}`,
				details: {
					minBorrowAmount,
					maxBorrowAmount: effectiveMaxBorrow,
				},
			};
		}

		// Check health factor if borrow amount is specified
		if (borrowAmount > 0n) {
			const borrowValueUSD = borrowAmount;
			const remainingLiquidity = accountLiquidityValue - borrowValueUSD;
			const postBorrowHealthFactor =
				remainingLiquidity > 0n
					? Number(formatUnits(remainingLiquidity, 18)) / Number(formatUnits(borrowValueUSD, 18))
					: 0;

			if (postBorrowHealthFactor < HEALTH_FACTOR_CONSTANTS.SAFE_THRESHOLD) {
				return {
					...defaultResult,
					reason: 'HEALTH_FACTOR_TOO_LOW',
					buttonText: 'Health Factor Too Low',
					details: {
						postBorrowHealthFactor,
						accountLiquidity: accountLiquidityValue,
					},
				};
			}
		}

		return {
			canBorrow: true,
			reason: 'ELIGIBLE',
			buttonText: 'Borrow',
			details: {
				availableLiquidity,
				userBorrowCapacity,
				maxBorrowAmount: effectiveMaxBorrow,
				accountLiquidity: accountLiquidityValue,
				accountShortfall,
				marketCash,
				totalBorrows,
				isMarketEntered,
				isPaused: !isListed,
				minBorrowAmount,
			},
		};
	}, [
		isConnected,
		userAddress,
		chainId,
		marketAddress,
		contractData,
		accountLiquidity,
		accountLiquidityError,
		isAccountLiquidityLoading,
		contractError,
		isContractLoading,
		borrowAmount,
		tokenDecimals,
		tokenSymbol,
	]);

	return result;
}
