import type { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { NavigationPanel } from './navigation-panel/navigation-panel.component';
import { Logo } from './logo/logo.component';
import { SocialNetwork } from './social-network/social-network.component';
import { SignIn } from './sign-in/sign-in.component';
import { FaucetButton } from './faucet-button/faucet-button.component';
import { FlexContainer } from '../../ui-kit/components/flex-container/flex-container.component';

import css from './header.module.css';

export const Header: FC = () => {
	const location = useLocation();
	const isLandingPage = location.pathname === '/';

	if (isLandingPage) {
		return null;
	}

	return (
		<FlexContainer variant="spaceBetween" className={css.container}>
			<FlexContainer variant="alignCenter" className={css.navigation}>
				<div className={css.logo}>
					<Logo />
				</div>
				<NavigationPanel />
			</FlexContainer>
			<FlexContainer variant="alignCenter" className={css.controls}>
				<SocialNetwork />
				<FaucetButton />
				<SignIn />
			</FlexContainer>
		</FlexContainer>
	);
};
