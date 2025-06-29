import type { FC } from 'react';
import { NavigationPanel } from '../navigation-panel/navigation-panel.component';
import { Logo } from '../logo/logo.component';
import { SocialNetwork } from '../social-network/social-network.component';
import { SignIn } from '../sign-in/sign-in.component';

import css from './header.module.css';

export const Header: FC = () => {
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
				<SignIn />
			</div>
		</div>
	);
};
