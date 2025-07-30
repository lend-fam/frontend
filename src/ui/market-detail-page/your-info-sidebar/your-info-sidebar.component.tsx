import { type FC, useState, useMemo } from 'react';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from '../../../ui-kit/components/button/button.component';
import { SupplyModal } from '../../../ui-kit/components/supply-modal/supply-modal.component';
import { BorrowModal } from '../../../ui-kit/components/borrow-modal/borrow-modal.component';
import { Tooltip } from '../../../ui-kit/components/tooltip/tooltip.component';
import { Card } from '../../../ui-kit/components/card/card.component';
import { SectionHeader } from '../../../ui-kit/components/section-header/section-header.component';
import { MarketService, PriceService } from '../../../services';
import { useTokenPrices } from '../../../services/price.service';
import { useMarketWalletBalances, useAccountLiquidity } from '../../../hooks';
import { useUserSupplyPositions } from '../../../hooks/use-user-positions.hook';

import css from './your-info-sidebar.module.css';

interface YourInfoSidebarProps {
	symbol: string;
	marketAddress: Address;
	marketData: {
		totalSupply: bigint;
		totalBorrows: bigint;
		exchangeRate: bigint;
	};
	liquidityData?: bigint;
	supplyAPY: string;
	borrowAPY: string;
}

export const YourInfoSidebar: FC<YourInfoSidebarProps> = ({
	symbol,
	marketAddress,
	liquidityData,
	supplyAPY,
	borrowAPY,
}) => {
	const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
	const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
	const { address: userAddress } = useAccount();

	const { data: walletBalances } = useMarketWalletBalances([marketAddress]);
	const userWalletBalance = walletBalances?.[marketAddress] || 0n;

	const { data: accountLiquidity } = useAccountLiquidity(userAddress);
	const borrowingCapacity = accountLiquidity?.[1] || 0n;

	const { data: userSupplyPositions, isLoading: supplyLoading } = useUserSupplyPositions(userAddress);

	const hasAnySuppliedPositions =
		userSupplyPositions && Object.values(userSupplyPositions).some((pos) => pos.hasSupplied);
	const hasZeroBorrowCapacity = borrowingCapacity === 0n;

	const shouldShowTooltip = !supplyLoading && hasAnySuppliedPositions && hasZeroBorrowCapacity;

	const { data: pricesData } = useTokenPrices([marketAddress]);
	const tokenPrice = pricesData?.[0]?.result as bigint | undefined;
	const usdValues = useMemo(() => {
		const fallbackPrice = PriceService.getFallbackPrice(symbol);

		const walletUSD = tokenPrice
			? PriceService.calculateUSDValue(userWalletBalance, 18, tokenPrice)
			: PriceService.calculateUSDValueWithFallback(userWalletBalance, 18, fallbackPrice);

		const supplyUSD = tokenPrice
			? PriceService.calculateUSDValue(userWalletBalance, 18, tokenPrice)
			: PriceService.calculateUSDValueWithFallback(userWalletBalance, 18, fallbackPrice);

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

	const availableToSupply = userWalletBalance;
	const availableToSupplyFormatted = MarketService.formatTokenBalance(availableToSupply, 18);
	const maxBorrowFromLiquidity = Math.min(Number(liquidityData || 0n), Number(usdValues.borrowTokenAmount));
	const availableToBorrow = BigInt(Math.floor(maxBorrowFromLiquidity));
	const availableToBorrowFormatted = MarketService.formatTokenBalance(availableToBorrow, 18);

	return (
		<Card style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
			<SectionHeader title="Your info" variant="main" />

			<div className={css.balanceSection}>
				<div className={css.balanceItem}>
					<div className={css.balanceHeader}>
						<span className={css.balanceIcon}>💰</span>
						<span className={css.balanceLabel}>Wallet balance</span>
					</div>
					<div className={css.balanceValue}>{availableToSupplyFormatted}</div>
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
						variant="secondary"
						size="medium"
						className={css.actionButton}
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
					{shouldShowTooltip ? (
						<Tooltip content="Enable your supplied assets as collateral to start borrowing" position="top">
							<Button
								variant="outline"
								size="medium"
								className={css.actionButton}
								onClick={() => setIsBorrowModalOpen(true)}
								disabled={borrowingCapacity === 0n}>
								Borrow
							</Button>
						</Tooltip>
					) : (
						<Button
							variant="outline"
							size="medium"
							className={css.actionButton}
							onClick={() => setIsBorrowModalOpen(true)}
							disabled={borrowingCapacity === 0n}>
							Borrow
						</Button>
					)}
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
		</Card>
	);
};
