import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { useChainId } from 'wagmi';
import { apeChainTestnet } from '../../../config/wagmi.config';

import css from './faucet-button.module.css';

export const FaucetButton: FC = () => {
	const chainId = useChainId();

	// Only show faucet button on testnet
	if (chainId !== apeChainTestnet.id) {
		return null;
	}

	return (
		<Link to="/faucet" className={css.faucetButton}>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M8 1L9.5 4.5H13L10.5 7L11.5 10.5L8 8.5L4.5 10.5L5.5 7L3 4.5H6.5L8 1Z" fill="currentColor" />
			</svg>
			Testnet Faucet
		</Link>
	);
};
