import type { FC } from 'react';
import { Link } from '../../../ui-kit/components/link/link.component';
import { Icon } from '../../../ui-kit/components/icon/icon.component';

import logo from '../../../assets/svg/logo.svg';

export const Logo: FC = () => (
	<Link to="/">
		<Icon src={logo} />
	</Link>
);
