import type { FC } from 'react';
import { Link } from '../../../ui-kit/components/link/link.component';

import css from './footer-navigation-panel.module.css';

export const FooterNavigationPanel: FC = () => {
	return (
		<nav className={css.container}>
			<ul>
				<li className={css.item}>
					<Link href="" className={css.link}>
						Markets
					</Link>
				</li>
				<li className={css.item}>
					<Link href="" className={css.link}>
						Dashboard
					</Link>
				</li>
				<li className={css.item}>
					<Link href="" className={css.link}>
						Collections
					</Link>
				</li>
				<li className={css.item}>
					<Link href="" className={css.link}>
						XP
					</Link>
				</li>
			</ul>
		</nav>
	);
};
