import type { FC } from 'react';
import { Header } from '../header/header/header.component';
import { Markets } from '../markets/markets/markets.component';

import css from './app.module.css';

export const App: FC = () => (
	<div className={css.container}>
		<Header />
		<Markets />
	</div>
);
