import { type FC, useCallback } from 'react';
import type { Address } from 'viem';
import { useChainId } from 'wagmi';
import { PRICE_ORACLE_ABI } from '../../../contracts';
import { getBlockExplorerUrl } from '../../../config/wagmi.config';
// import { Icon } from '../../../ui-kit/components/icon/icon.component';
import { MarketService, PriceService } from '../../../services';
import { useUSDBalances, useClipboard } from '../../../hooks';
import { useTypedReadContracts, useTypedOracleAddress } from '../../../hooks/use-typed-contracts';

import css from './market-header.module.css';

interface MarketHeaderProps {
	symbol: string;
	marketAddress: Address;
	marketData: {
		totalSupply: bigint;
		totalBorrows: bigint;
		totalReserves: bigint;
		exchangeRate: bigint;
		getCash: bigint;
	};
	apyData: {
		supplyAPY: string;
		borrowAPY: string;
	};
	liquidityData?: bigint;
}

export const MarketHeader: FC<MarketHeaderProps> = ({ symbol, marketAddress, marketData, liquidityData }) => {
	const chainId = useChainId();
	const { isCopied, copyToClipboard } = useClipboard({
		successMessage: `${symbol} contract address copied`,
	});

	const handleCopyAddress = useCallback(async () => {
		await copyToClipboard(marketAddress);
	}, [marketAddress, copyToClipboard]);

	const handleOpenScanner = useCallback(() => {
		const baseUrl = getBlockExplorerUrl(chainId);
		const scannerUrl = `${baseUrl}/address/${marketAddress}`;
		window.open(scannerUrl, '_blank', 'noopener,noreferrer');
	}, [marketAddress, chainId]);

	// Fetch oracle address and then oracle price
	const { data: oracleAddress } = useTypedOracleAddress(chainId);

	const { extractBigInt } = useTypedReadContracts({
		contracts: [
			{
				address: oracleAddress!,
				abi: PRICE_ORACLE_ABI,
				functionName: 'getUnderlyingPrice',
				args: [marketAddress],
			},
		],
		query: {
			enabled: !!oracleAddress,
			staleTime: 60000, // 1 minute
		},
	});

	const oraclePrice = extractBigInt(0);

	// Calculate total supplied in underlying tokens
	const totalSuppliedUnderlying =
		marketData.exchangeRate > 0n ? (marketData.totalSupply * marketData.exchangeRate) / 10n ** 18n : 0n;

	// Use getCash from marketData or fallback to liquidityData
	const availableLiquidity = marketData.getCash || liquidityData || 0n;

	// Get USD values - if zero, use fallback
	const balanceData = [
		{
			marketAddress,
			balance: totalSuppliedUnderlying,
			symbol,
			decimals: 18,
		},
	];
	const { data: usdBalances } = useUSDBalances(balanceData);
	let reserveSize = usdBalances?.[marketAddress] || '0';

	// If we have zero reserve size but non-zero supply, estimate from token amount
	if (reserveSize === '0' && totalSuppliedUnderlying > 0n) {
		const tokenAmount = Number(totalSuppliedUnderlying) / 1e18;
		// Use estimated price based on symbol (fallback logic)
		const estimatedPrice =
			symbol === 'USDT' || symbol === 'USDC' ? 1 : symbol === 'ETH' ? 3200 : symbol === 'BTC' ? 65000 : 100;
		reserveSize = (tokenAmount * estimatedPrice).toString();
	}

	const availableLiquidityFormatted = MarketService.formatTokenBalance(availableLiquidity, 18);

	// Calculate utilization rate using the correct Compound formula
	const utilizationRate = MarketService.calculateUtilizationRate(
		marketData.totalBorrows,
		marketData.getCash,
		marketData.totalReserves,
	);

	// Format oracle price using real data or show loading/unavailable
	let formattedOraclePrice: string;
	if (oraclePrice && oraclePrice > 0n) {
		// Oracle prices are usually scaled by 1e18 or 1e36, check the scale
		const priceNumber = Number(oraclePrice) / 1e18; // Try 1e18 first
		formattedOraclePrice = PriceService.formatUSDValue(priceNumber.toString());
	} else {
		formattedOraclePrice = 'Price unavailable';
	}

	return (
		<div className={css.container}>
			<div className={css.tokenInfo}>
				<div className={css.tokenIcon}>🪙</div>
				<div className={css.tokenDetails}>
					<h1 className={css.tokenName}>{symbol}</h1>
					<span className={css.tokenSymbol}>{symbol}</span>
				</div>
				<div className={css.tokenActions}>
					<button
						className={`${css.copyButton} ${isCopied ? css.copied : ''}`}
						onClick={handleCopyAddress}
						title={isCopied ? 'Copied!' : 'Copy contract address'}>
						{isCopied ? '✅' : '📋'}
					</button>
					<button className={css.externalButton} onClick={handleOpenScanner} title="View on block explorer">
						🔗
					</button>
				</div>
			</div>

			<div className={css.metrics}>
				<div className={css.metric}>
					<span className={css.metricLabel}>Reserve Size</span>
					<span className={css.metricValue}>{PriceService.formatUSDValue(reserveSize)}</span>
				</div>
				<div className={css.metric}>
					<span className={css.metricLabel}>Available liquidity</span>
					<span className={css.metricValue}>
						{availableLiquidityFormatted} {symbol}
					</span>
				</div>
				<div className={css.metric}>
					<span className={css.metricLabel}>Utilization Rate</span>
					<span className={css.metricValue}>{utilizationRate.toFixed(2)}%</span>
				</div>
				<div className={css.metric}>
					<span className={css.metricLabel}>Oracle price</span>
					<div className={css.oraclePrice}>
						<span className={css.metricValue}>{formattedOraclePrice}</span>
						{oracleAddress && (
							<button
								className={css.oracleButton}
								onClick={() => {
									const baseUrl = getBlockExplorerUrl(chainId);
									const oracleUrl = `${baseUrl}/address/${oracleAddress}`;
									window.open(oracleUrl, '_blank', 'noopener,noreferrer');
								}}
								title="View Oracle Contract">
								🔗
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
