import { memo, type FC } from 'react';

import css from './social-network.module.css';

import discordIcon from '../../../assets/svg/discord.svg';
import xIcon from '../../../assets/svg/x.svg';

export const SocialNetwork: FC = () => {
	return (
		<ul className={css.container}>
			<Network icon={discordIcon} path={'/'} />
			<Network icon={xIcon} path={'/'} />
		</ul>
	);
};

interface NetworkProps {
	icon: string;
	path: string;
}

const Network = memo<NetworkProps>((props) => {
	const { icon, path } = props;

	return (
		<li className={css.network}>
			<a href={path}>
				<img src={icon} />
			</a>
		</li>
	);
});

Network.displayName = 'Network';
