import { useMemo, type FC } from 'react';
import { Header } from '../header/header/header.component';
import { MarketsPage } from '../markets-page/markets-page/markets-page.component';
import { BrowserProviderService } from '../../services/browser-provider.service';
import { AccountProviderService } from '../../services/account-provider.service';

import css from './app.module.css';
import '../../assets/fonts/fonts.css';

export const App: FC = () => {
	const browserProviderService = useMemo(() => new BrowserProviderService(window.ethereum!), []);
	const accountProviderService = useMemo(
		() => new AccountProviderService(browserProviderService.getBrowserProvider()),
		[browserProviderService],
	);

	return (
		<div className={css.container}>
			<Header />
			<MarketsPage />
		</div>
	);
};
