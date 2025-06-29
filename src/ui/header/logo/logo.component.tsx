import type { FC } from 'react';
import { Link } from '../../../ui-kit/components/link/link.component';

import logo from '../../../assets/svg/logo.svg';

export const Logo: FC = () => (
	<Link href="/">
		<img src={logo} />
	</Link>
);
