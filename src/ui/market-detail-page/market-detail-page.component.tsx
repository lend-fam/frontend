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
	useTokenMetadata,
} from '../../hooks';
import { TokenService } from '../../services';

import css from './market-detail-page.module.css';

export const MarketDetailPage: FC = () => {
	const { marketAddress } = useParams<{ marketAddress: string }>();

	const { data: marketsAPY } = useMarketsAPY();
	const { data: marketTotals } = useMarketTotals();
	const { data: availableLiquidity } = useMarketsAvailableLiquidity();
	const { data: collateralFactors } = useMarketsCollateralFactors();
	const { data: tokenMetadata } = useTokenMetadata(marketAddress ? [marketAddress as Address] : []);

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

	const metadata = tokenMetadata?.[address as Address];
	const symbol = TokenService.formatMarketName(undefined, undefined, address, metadata);

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
