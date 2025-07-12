import { type FC } from 'react';
import { MarketService } from '../../../../../services/market.service';

import css from './balance-column.module.css';

interface BalanceColumnProps {
	tokenAmount: string;
	usdValue?: string;
	symbol?: string;
}

export const BalanceColumn: FC<BalanceColumnProps> = ({ tokenAmount, usdValue, symbol }) => {
	const displayAmount = tokenAmount === '0' ? '0' : `${tokenAmount}${symbol ? ` ${symbol}` : ''}`;
	const displayUSD = usdValue ? MarketService.formatUSDValue(usdValue) : '$0.00';

	return (
		<div className={css.container}>
			<div className={css.tokenAmount}>{displayAmount}</div>
			<div className={css.usdValue}>{displayUSD}</div>
		</div>
	);
};
