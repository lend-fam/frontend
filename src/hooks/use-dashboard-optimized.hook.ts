import { useReadContracts, useChainId, useAccount, useBalance } from 'wagmi';
import { useMemo } from 'react';
import type { Address } from 'viem';
import { isAddressEqual, zeroAddress } from 'viem';
import { LENS_ABI, getLensAddress } from '../contracts';
import { MarketService } from '../services/market.service';
import { useAllMarkets } from './use-market-core.hook';
import { MARKET_QUERY_CONFIG } from './market-query.constants';
import type { CTokenMetadata } from './use-market-data-optimized.hook';

interface CTokenBalances {
	cToken: Address;
	balanceOf: bigint;
	borrowBalanceCurrent: bigint;
	balanceOfUnderlying: bigint;
	tokenBalance: bigint; // Underlying token balance in wallet
	tokenAllowance: bigint;
}

export interface DashboardData {
	marketMetadata: Record<Address, CTokenMetadata>;
	userSupplyPositions: Record<Address, { balance: bigint; hasSupplied: boolean }>;
	walletBalances: Record<Address, bigint>;
	apyData: Record<Address, { supplyAPY: string; borrowAPY: string }>;
	exchangeRateData: Record<Address, bigint>;
	collateralFactorData: Record<Address, number>;
	liquidityData: Record<Address, bigint>;
	userBorrowBalances: Record<Address, bigint>;
}

/**
 * Super-optimized hook that uses Lens contract to fetch ALL dashboard data
 * in 2-3 RPC calls instead of 100+. Replaces multiple hooks:
 * - useMarketsDataOptimized
 * - useUserSupplyPositions
 * - useMarketWalletBalances
 * - useUserBorrowPositions
 */
export function useDashboardOptimized() {
	const chainId = useChainId();
	const { address: userAddress } = useAccount();
	const { data: marketAddresses, isLoading: marketsLoading } = useAllMarkets();

	// Call 1: Get all market metadata (APYs, rates, liquidity, underlying tokens)
	const { data: metadataResult, isLoading: metadataLoading } = useReadContracts({
		contracts: [
			{
				address: getLensAddress(chainId),
				abi: LENS_ABI,
				functionName: 'cTokenMetadataAll',
				args: marketAddresses ? [marketAddresses] : undefined,
			},
		],
		query: {
			enabled: !!marketAddresses && marketAddresses.length > 0,
			...MARKET_QUERY_CONFIG.MARKET_INFO,
		},
	});

	// Call 2: Get all user balances (supply, borrow, wallet) if wallet connected
	const { data: balancesResult, isLoading: balancesLoading } = useReadContracts({
		contracts:
			userAddress && marketAddresses
				? [
						{
							address: getLensAddress(chainId),
							abi: LENS_ABI,
							functionName: 'cTokenBalancesAll',
							args: [marketAddresses, userAddress],
						},
					]
				: [],
		query: {
			enabled: !!userAddress && !!marketAddresses && marketAddresses.length > 0,
			...MARKET_QUERY_CONFIG.USER_POSITIONS,
		},
	});

	// Get underlying tokens and check for native tokens
	const underlyingTokens = useMemo(() => {
		const tokens: Record<Address, Address | 'native'> = {};
		const nativeTokenMarkets: Address[] = [];

		if (metadataResult?.[0]?.status === 'success') {
			const metadata = metadataResult[0].result as CTokenMetadata[];
			metadata.forEach((meta) => {
				if (isAddressEqual(meta.underlyingAssetAddress, zeroAddress)) {
					tokens[meta.cToken] = 'native';
					nativeTokenMarkets.push(meta.cToken);
				} else {
					tokens[meta.cToken] = meta.underlyingAssetAddress;
				}
			});
		}

		return { tokens, nativeTokenMarkets };
	}, [metadataResult]);

	// Call 3: Get native token balance if needed
	const { data: nativeBalance, isLoading: nativeBalanceLoading } = useBalance({
		address: userAddress,
		query: {
			enabled: !!userAddress && underlyingTokens.nativeTokenMarkets.length > 0,
			...MARKET_QUERY_CONFIG.WALLET_BALANCES,
		},
	});

	const processedData = useMemo(() => {
		const data: DashboardData = {
			marketMetadata: {},
			userSupplyPositions: {},
			walletBalances: {},
			apyData: {},
			exchangeRateData: {},
			collateralFactorData: {},
			liquidityData: {},
			userBorrowBalances: {},
		};

		if (!marketAddresses || !metadataResult?.[0] || metadataResult[0].status !== 'success') {
			return data;
		}

		const metadata = metadataResult[0].result as CTokenMetadata[];
		const balances =
			balancesResult?.[0]?.status === 'success' ? (balancesResult[0].result as CTokenBalances[]) : [];

		// Process market metadata
		metadata.forEach((meta, index) => {
			const address = meta.cToken;

			// Store complete metadata
			data.marketMetadata[address] = meta;

			// APY calculations
			const supplyAPY = MarketService.calculateSupplyAPY(meta.supplyRatePerBlock);
			const borrowAPY = MarketService.calculateBorrowAPY(meta.borrowRatePerBlock);
			data.apyData[address] = { supplyAPY, borrowAPY };

			// Exchange rates
			data.exchangeRateData[address] = meta.exchangeRateCurrent;

			// Collateral factors
			data.collateralFactorData[address] = Number(meta.collateralFactorMantissa) / 1e18;

			// Available liquidity
			data.liquidityData[address] = meta.totalCash;

			// Process user balances if available
			const userBalance = balances[index];
			if (userBalance) {
				// Supply positions
				data.userSupplyPositions[address] = {
					balance: userBalance.balanceOfUnderlying,
					hasSupplied: userBalance.balanceOfUnderlying > 0n,
				};

				// Borrow balances
				data.userBorrowBalances[address] = userBalance.borrowBalanceCurrent;

				// Wallet balances (underlying token balance)
				if (underlyingTokens.tokens[address] === 'native') {
					data.walletBalances[address] = nativeBalance?.value || 0n;
				} else {
					data.walletBalances[address] = userBalance.tokenBalance;
				}
			} else {
				// Default values when user not connected
				data.userSupplyPositions[address] = { balance: 0n, hasSupplied: false };
				data.userBorrowBalances[address] = 0n;
				data.walletBalances[address] = 0n;
			}
		});

		return data;
	}, [marketAddresses, metadataResult, balancesResult, underlyingTokens, nativeBalance]);

	const isLoading = marketsLoading || metadataLoading || balancesLoading || nativeBalanceLoading;

	return {
		data: processedData,
		isLoading,
		// Individual data accessors for backward compatibility
		marketMetadata: processedData.marketMetadata,
		userSupplyPositions: processedData.userSupplyPositions,
		walletBalances: processedData.walletBalances,
		apyData: processedData.apyData,
		exchangeRateData: processedData.exchangeRateData,
		collateralFactorData: processedData.collateralFactorData,
		liquidityData: processedData.liquidityData,
		userBorrowBalances: processedData.userBorrowBalances,
	};
}
