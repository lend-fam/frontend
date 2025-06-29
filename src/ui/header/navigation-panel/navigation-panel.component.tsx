import { memo, type FC } from 'react';
import cn from 'classnames';
import { Link } from '../../../ui-kit/components/link/link.component';

import css from './navigation-panel.module.css';

export const NavigationPanel: FC = () => {
	return (
		<nav className={css.container}>
			<ul className={css.list}>
				<NavigationLink label={'Markets'} path={'/'} />
				<NavigationLink label={'Dashboard'} path={'/'} />
				<NavigationLink label={'Collections'} path={'/'} />
				<NavigationLink label={'Profile'} path={'/'} />
			</ul>
		</nav>
	);
};

interface NavigationLinkProps {
	label: string;
	path: string;
}

const NavigationLink = memo<NavigationLinkProps>((props) => {
	const { label, path } = props;

	const className = cn(css.link, css.link);

	return (
		<li className={className}>
			<Link href={path}>{label}</Link>
		</li>
	);
});

NavigationLink.displayName = 'NavigationLink';
