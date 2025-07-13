import { memo, type FC } from 'react';
import { useLocation } from 'react-router-dom';
import cn from 'classnames';
import { Link } from '../../../ui-kit/components/link/link.component';

import css from './navigation-panel.module.css';

export const NavigationPanel: FC = () => {
	const location = useLocation();

	return (
		<nav className={css.container}>
			<ul className={css.list}>
				<NavigationLink label="Markets" path="/markets" isActive={location.pathname === '/markets'} />
				<NavigationLink
					label="Dashboard"
					path="/dashboard"
					isActive={location.pathname === '/dashboard' || location.pathname === '/'}
				/>
				<NavigationLink
					label="Collections"
					path="/collections"
					isActive={location.pathname === '/collections'}
				/>
				<NavigationLink label="Profile" path="/profile" isActive={location.pathname === '/profile'} />
			</ul>
		</nav>
	);
};

interface NavigationLinkProps {
	label: string;
	path: string;
	isActive?: boolean;
}

const NavigationLink = memo<NavigationLinkProps>(({ label, path, isActive }) => {
	const className = cn(css.link, { [css.link_active]: isActive });

	return (
		<li className={className}>
			<Link to={path}>{label}</Link>
		</li>
	);
});

NavigationLink.displayName = 'NavigationLink';
