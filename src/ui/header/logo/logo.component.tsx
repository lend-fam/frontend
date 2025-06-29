import type { FC } from 'react';

import logo from '../../../assets/svg/logo.svg';

export const Logo: FC = () => (
	<a href="/">
		<img src={logo} />
	</a>
);
