import type { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { NavigationPanel } from './navigation-panel/navigation-panel.component';
import { Logo } from './logo/logo.component';
import { SocialNetwork } from './social-network/social-network.component';
import { SignIn } from './sign-in/sign-in.component';
import { FaucetButton } from './faucet-button/faucet-button.component';

import css from './header.module.css';

export const Header: FC = () => {
	const location = useLocation();
	const isLandingPage = location.pathname === '/';

	if (isLandingPage) {
		return null;
	}

	return (
		<div className={css.container}>
			<div className={css.navigation}>
				<div className={css.logo}>
					<Logo />
				</div>
				<NavigationPanel />
			</div>
			<div className={css.controls}>
				<SocialNetwork />
				<FaucetButton />
				<SignIn />
			</div>
		</div>
	);
};
