import { type FC } from 'react';
import type { Address } from 'viem';
import { useReadContract, useChainId } from 'wagmi';
import { CTOKEN_ABI } from '../../../contracts';
import { getBlockExplorerUrl } from '../../../config/wagmi.config';

import css from './collector-info-section.module.css';

interface CollectorInfoSectionProps {
	marketAddress: Address;
}

export const CollectorInfoSection: FC<CollectorInfoSectionProps> = ({ marketAddress }) => {
	const chainId = useChainId();
	// Fetch real reserve factor from contract
	const { data: reserveFactorMantissa } = useReadContract({
		address: marketAddress,
		abi: CTOKEN_ABI,
		functionName: 'reserveFactorMantissa',
		query: {
			staleTime: 300000, // 5 minutes
		},
	});

	// Convert mantissa to percentage (divide by 1e18 and multiply by 100)
	const reserveFactor = reserveFactorMantissa ? ((Number(reserveFactorMantissa) / 1e18) * 100).toFixed(2) : '0.00';

	const shortAddress = `${marketAddress.slice(0, 6)}...${marketAddress.slice(-4)}`;
	const explorerUrl = getBlockExplorerUrl(chainId);

	return (
		<div className={css.container}>
			<h2 className={css.title}>Collector Info</h2>

			<div className={css.content}>
				<div className={css.info}>
					<div className={css.infoItem}>
						<span className={css.label}>Reserve factor</span>
						<span className={css.value}>{reserveFactor}%</span>
					</div>
					<div className={css.infoItem}>
						<span className={css.label}>Collector Contract</span>
						<a
							href={`${explorerUrl}/address/${marketAddress}`}
							target="_blank"
							rel="noopener noreferrer"
							className={css.contractButton}>
							{shortAddress}
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};
