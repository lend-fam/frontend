import { type FC } from 'react';
import { useParams } from 'react-router-dom';
import type { Address } from 'viem';
import { Layout } from '../layout/layout.component';
import { MarketHeader } from './market-header/market-header.component';
import { ReserveStatusSection } from './reserve-status-section/reserve-status-section.component';
import { BorrowInfoSection } from './borrow-info-section/borrow-info-section.component';
import { CollectorInfoSection } from './collector-info-section/collector-info-section.component';
import { InterestRateModelSection } from './interest-rate-model-section/interest-rate-model-section.component';
import { YourInfoSidebar } from './your-info-sidebar/your-info-sidebar.component';
import {
	useMarketsAPY,
	useMarketTotals,
	useMarketsAvailableLiquidity,
	useMarketsCollateralFactors,
	useUserSupplyPositions,
	useAllMarkets,
} from '../../hooks';
import { useAccount } from 'wagmi';
import { TokenService } from '../../services';

import css from './market-detail-page.module.css';

export const MarketDetailPage: FC = () => {
	const { marketAddress } = useParams<{ marketAddress: string }>();
	const { address: userAddress } = useAccount();

	const { data: allMarkets, isLoading: marketsLoading, error: marketsError } = useAllMarkets();
	const { data: marketsAPY } = useMarketsAPY();
	const { data: marketTotals } = useMarketTotals();
	const { data: availableLiquidity } = useMarketsAvailableLiquidity();
	const { data: collateralFactors } = useMarketsCollateralFactors();
	const { data: userPositions } = useUserSupplyPositions(userAddress);

	if (!marketAddress) {
		return (
			<Layout>
				<div className={css.error}>Market not found</div>
			</Layout>
		);
	}

	const address = marketAddress as Address;
	const marketData = marketTotals?.[address];
	const apyData = marketsAPY?.[address];
	const liquidityData = availableLiquidity?.[address];
	const collateralFactor = collateralFactors?.[address];
	const userPosition = userPositions?.[address];

	// Debug logging to understand the data flow
	console.log('=== Market Detail Debug Info ===');
	console.log('Market Address:', address);
	console.log('All Markets from getAllMarkets:', allMarkets);
	console.log('Markets Loading:', marketsLoading);
	console.log('Markets Error:', marketsError);
	console.log('All Market Totals:', marketTotals);
	console.log('Market Data for this address:', marketData);
	console.log('All APY Data:', marketsAPY);
	console.log('APY Data for this address:', apyData);
	console.log('All Liquidity Data:', availableLiquidity);
	console.log('Liquidity Data for this address:', liquidityData);
	console.log('All Collateral Factors:', collateralFactors);
	console.log('Collateral Factor for this address:', collateralFactor);
	console.log('================================');

	const displayName = TokenService.formatMarketName(undefined, undefined, address);
	const symbol = displayName.replace('Market ', '').split(' ')[0];

	if (!marketData || !apyData) {
		return (
			<Layout>
				<div className={css.loading}>Loading market data...</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className={css.container}>
				<MarketHeader
					symbol={symbol}
					marketAddress={address}
					marketData={marketData}
					apyData={apyData}
					liquidityData={liquidityData}
				/>

				<div className={css.content}>
					<div className={css.mainContent}>
						<ReserveStatusSection
							symbol={symbol}
							marketAddress={address}
							marketData={marketData}
							apyData={apyData}
							collateralFactor={collateralFactor}
						/>

						<BorrowInfoSection
							symbol={symbol}
							marketAddress={address}
							marketData={marketData}
							apyData={apyData}
							liquidityData={liquidityData}
						/>

						<CollectorInfoSection marketAddress={address} />

						<InterestRateModelSection marketAddress={address} apyData={apyData} />
					</div>

					<div className={css.sidebar}>
						<YourInfoSidebar
							symbol={symbol}
							marketAddress={address}
							marketData={marketData}
							userPosition={userPosition}
							liquidityData={liquidityData}
							supplyAPY={apyData?.supplyAPY || '0'}
							borrowAPY={apyData?.borrowAPY || '0'}
						/>
					</div>
				</div>
			</div>
		</Layout>
	);
};
