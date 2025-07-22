import { useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import { usePriceOracle, useTokenPrices } from '../services/price.service';
import { usePythOracleStatus } from '../hooks/use-pyth-oracle-status.hook';

export function OracleDebugComponent() {
	const chainId = useChainId();
	const { data: oracleAddress } = usePriceOracle();
	const marketAddresses: `0x${string}`[] = []; // TODO: Replace with actual market addresses hook
	const { data: tokenPricesData, error: pricesError } = useTokenPrices(marketAddresses || []);

	// Test with first market if available
	const firstMarket = marketAddresses?.[0] as `0x${string}` | undefined;
	const oracleStatus = usePythOracleStatus(firstMarket);

	return (
		<div
			style={{
				position: 'fixed',
				top: '10px',
				right: '10px',
				background: 'white',
				border: '1px solid #ccc',
				borderRadius: '8px',
				padding: '16px',
				zIndex: 1000,
				maxWidth: '400px',
				fontSize: '12px',
				fontFamily: 'monospace',
			}}>
			<h3>Oracle Debug Info</h3>

			<div>
				<strong>Chain ID:</strong> {chainId}
			</div>
			<div>
				<strong>Oracle Address:</strong> {oracleAddress || 'Loading...'}
			</div>
			<div>
				<strong>Market Addresses Count:</strong> {marketAddresses?.length || 0}
			</div>

			{pricesError && (
				<div style={{ color: 'red' }}>
					<strong>Prices Error:</strong> {pricesError.message}
				</div>
			)}

			{tokenPricesData && (
				<div>
					<h4>Token Prices:</h4>
					{tokenPricesData.map((result, index) => {
						const marketAddr = marketAddresses?.[index];
						if (!result.result) {
							return (
								<div key={index} style={{ color: 'red' }}>
									Market {index} ({marketAddr?.slice(0, 8)}...): Failed
								</div>
							);
						}

						const price = result.result as bigint;
						const priceFormatted = formatUnits(price, 18);

						return (
							<div key={index} style={{ marginBottom: '4px' }}>
								<div>
									Market {index} ({marketAddr?.slice(0, 8)}...):
								</div>
								<div> Raw: {price.toString()}</div>
								<div> Formatted: ${priceFormatted}</div>
							</div>
						);
					})}
				</div>
			)}

			{firstMarket && (
				<div>
					<h4>Oracle Status (First Market):</h4>
					<div>
						<strong>Type:</strong> {oracleStatus.oracleType}
					</div>
					<div>
						<strong>Price Source:</strong> {oracleStatus.priceSource}
					</div>
					<div>
						<strong>Health:</strong> {oracleStatus.healthStatus}
					</div>
					<div>
						<strong>Status:</strong> {oracleStatus.statusMessage}
					</div>
					<div>
						<strong>Can Borrow:</strong> {oracleStatus.canBorrow ? 'Yes' : 'No'}
					</div>

					{oracleStatus.assetInfo.priceFeedId && (
						<div>
							<strong>Price Feed:</strong> {oracleStatus.assetInfo.priceFeedIdFormatted}
						</div>
					)}

					{oracleStatus.assetInfo.fallbackPrice !== undefined && (
						<div>
							<strong>Fallback Price:</strong>{' '}
							{oracleStatus.assetInfo.fallbackPrice === 0n
								? '0'
								: formatUnits(oracleStatus.assetInfo.fallbackPrice, 18)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
