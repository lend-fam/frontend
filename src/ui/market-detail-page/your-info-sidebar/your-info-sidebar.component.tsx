import { type FC, useState, useMemo } from 'react';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from '../../../ui-kit/components/button/button.component';
import { SupplyModal } from '../../../ui-kit/components/supply-modal/supply-modal.component';
import { BorrowModal } from '../../../ui-kit/components/borrow-modal/borrow-modal.component';
import { MarketService, PriceService } from '../../../services';
import { useTokenPrices } from '../../../services/price.service';
import { useMarketWalletBalances, useAccountLiquidity } from '../../../hooks';
// import type { UserMarketPosition } from '../../../types/market.types';

import css from './your-info-sidebar.module.css';

interface YourInfoSidebarProps {
	symbol: string;
	marketAddress: Address;
	marketData: {
		totalSupply: bigint;
		totalBorrows: bigint;
		exchangeRate: bigint;
	};
	userPosition?: {
		balance: bigint;
		hasSupplied: boolean;
	};
	liquidityData?: bigint;
	supplyAPY: string;
	borrowAPY: string;
}

export const YourInfoSidebar: FC<YourInfoSidebarProps> = ({
	symbol,
	marketAddress,
	userPosition: _, // eslint-disable-line @typescript-eslint/no-unused-vars
	liquidityData,
	supplyAPY,
	borrowAPY,
}) => {
	const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
	const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
	const { address: userAddress } = useAccount();

	// Fetch user's wallet balance for this market's underlying token
	const { data: walletBalances } = useMarketWalletBalances([marketAddress]);
	const userWalletBalance = walletBalances?.[marketAddress] || 0n;

	// Fetch user's account liquidity for borrowing capacity
	const { data: accountLiquidity } = useAccountLiquidity(userAddress);
	const borrowingCapacity = accountLiquidity?.[1] || 0n; // [error, liquidity, shortfall]

	// Fetch token prices
	const { data: pricesData } = useTokenPrices([marketAddress]);
	const tokenPrice = pricesData?.[0]?.result as bigint | undefined;

	// Calculate USD values using real price data
	const usdValues = useMemo(() => {
		const fallbackPrice = PriceService.getFallbackPrice(symbol);

		// Calculate USD values using oracle price or fallback
		const walletUSD = tokenPrice
			? PriceService.calculateUSDValue(userWalletBalance, 18, tokenPrice)
			: PriceService.calculateUSDValueWithFallback(userWalletBalance, 18, fallbackPrice);

		const supplyUSD = tokenPrice
			? PriceService.calculateUSDValue(userWalletBalance, 18, tokenPrice)
			: PriceService.calculateUSDValueWithFallback(userWalletBalance, 18, fallbackPrice);

		// Convert borrowing capacity from USD to token amount
		// borrowingCapacity is in USD with 18 decimals, need to convert to token amount
		const borrowTokenAmount = tokenPrice ? (borrowingCapacity * 10n ** 18n) / tokenPrice : 0n;
		const borrowUSD = tokenPrice
			? PriceService.calculateUSDValue(borrowTokenAmount, 18, tokenPrice)
			: PriceService.calculateUSDValueWithFallback(borrowTokenAmount, 18, fallbackPrice);
		const borrowUSDFormatted = PriceService.formatUSDValue(borrowUSD);

		return {
			wallet: PriceService.formatUSDValue(walletUSD),
			supply: PriceService.formatUSDValue(supplyUSD),
			borrow: borrowUSDFormatted,
			borrowTokenAmount,
		};
	}, [userWalletBalance, borrowingCapacity, tokenPrice, symbol]);

	// Available to supply = user's wallet balance of the underlying token
	const availableToSupply = userWalletBalance;
	const availableToSupplyFormatted = MarketService.formatTokenBalance(availableToSupply, 18);

	// Available to borrow = borrowing capacity converted to token amount, limited by market liquidity
	const maxBorrowFromLiquidity = Math.min(Number(liquidityData || 0n), Number(usdValues.borrowTokenAmount));
	const availableToBorrow = BigInt(Math.floor(maxBorrowFromLiquidity));
	const availableToBorrowFormatted = MarketService.formatTokenBalance(availableToBorrow, 18);

	return (
		<div className={css.container}>
			<h3 className={css.title}>Your info</h3>

			<div className={css.balanceSection}>
				<div className={css.balanceItem}>
					<div className={css.balanceHeader}>
						<span className={css.balanceIcon}>💰</span>
						<span className={css.balanceLabel}>Wallet balance</span>
					</div>
					<div className={css.balanceValue}>
						{availableToSupplyFormatted} {symbol}
					</div>
					<div className={css.balanceUsd}>{usdValues.wallet}</div>
				</div>
			</div>

			<div className={css.actionSection}>
				<div className={css.actionItem}>
					<div className={css.actionHeader}>
						<span className={css.actionLabel}>Available to supply</span>
						<span className={css.infoIcon}>ⓘ</span>
					</div>
					<div className={css.actionValue}>
						{availableToSupplyFormatted} {symbol}
					</div>
					<div className={css.actionUsd}>{usdValues.supply}</div>
					<Button
						className={`${css.actionButton} ${css.primaryButton}`}
						onClick={() => setIsSupplyModalOpen(true)}>
						Supply
					</Button>
				</div>

				<div className={css.actionItem}>
					<div className={css.actionHeader}>
						<span className={css.actionLabel}>Available to borrow</span>
						<span className={css.infoIcon}>ⓘ</span>
					</div>
					<div className={css.actionValue}>
						{availableToBorrowFormatted} {symbol}
					</div>
					<div className={css.actionUsd}>{usdValues.borrow}</div>
					<Button
						className={`${css.actionButton} ${css.secondaryButton}`}
						onClick={() => setIsBorrowModalOpen(true)}>
						Borrow
					</Button>
				</div>
			</div>

			<SupplyModal
				isOpen={isSupplyModalOpen}
				onClose={() => setIsSupplyModalOpen(false)}
				marketAddress={marketAddress}
				supplyAPY={supplyAPY}
				isCollateralEnabled={true}
			/>

			<BorrowModal
				isOpen={isBorrowModalOpen}
				onClose={() => setIsBorrowModalOpen(false)}
				marketAddress={marketAddress}
				tokenSymbol={symbol}
				borrowAPY={borrowAPY}
				availableLiquidity={liquidityData || 0n}
			/>
		</div>
	);
};
