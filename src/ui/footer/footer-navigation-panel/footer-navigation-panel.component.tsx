import type { FC } from 'react';
import { Link } from '../../../ui-kit/components/link/link.component';

import css from './footer-navigation-panel.module.css';

export const FooterNavigationPanel: FC = () => {
	return (
		<nav className={css.container}>
			<ul>
				<li className={css.item}>
					<Link to="/markets" className={css.link}>
						Markets
					</Link>
				</li>
				<li className={css.item}>
					<Link to="/dashboard" className={css.link}>
						Dashboard
					</Link>
				</li>
				<li className={css.item}>
					<Link to="/collections" className={css.link}>
						Collections
					</Link>
				</li>
				<li className={css.item}>
					<Link to="/profile" className={css.link}>
						Profile
					</Link>
				</li>
			</ul>
		</nav>
	);
};
