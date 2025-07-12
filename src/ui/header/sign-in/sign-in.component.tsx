import type { FC } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import css from './sign-in.module.css';

export const SignIn: FC = () => {
	return (
		<div className={css.container}>
			<ConnectButton />
		</div>
	);
};
