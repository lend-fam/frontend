import type { FC } from 'react';
import { Header } from '../header/header/header.component';
import { MarketsPage } from '../markets-page/markets-page/markets-page.component';

import css from './app.module.css';
import '../../assets/fonts/fonts.css';

export const App: FC = () => (
	<div className={css.container}>
		<Header />
		<MarketsPage />
	</div>
);
