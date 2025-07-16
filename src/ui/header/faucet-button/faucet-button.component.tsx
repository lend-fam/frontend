import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChainId } from 'wagmi';
import { apeChainTestnet } from '../../../config/wagmi.config';

import css from './faucet-button.module.css';

export const FaucetButton: FC = () => {
	const chainId = useChainId();
	const navigate = useNavigate();

	// Only show faucet button on testnet
	if (chainId !== apeChainTestnet.id) {
		return null;
	}

	return (
		<button
			className={css.faucetButton}
			onClick={() => navigate('/faucet')}
		>
			Testnet Faucet
		</button>
	);
};
