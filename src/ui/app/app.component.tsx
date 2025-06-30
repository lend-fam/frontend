import type { FC } from 'react';
import { Header } from '../header/header/header.component';
import { DashboardPage } from '../dashboard-page/dashboard-page/dashboard-page.component';

import css from './app.module.css';
import '../../assets/fonts/fonts.css';

export const App: FC = () => (
	<div className={css.container}>
		<Header />
		<DashboardPage />
	</div>
);
