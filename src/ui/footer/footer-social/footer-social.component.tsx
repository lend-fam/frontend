import { memo, type FC } from 'react';
import { Icon } from '../../../ui-kit/components/icon/icon.component';
import { Link } from '../../../ui-kit/components/link/link.component';

import css from './theme/footer-social.module.css';
import iconCss from './theme/icon.child.module.css';

import emailIcon from '../../../assets/svg/email.svg';
import discordIcon from '../../../assets/svg/discord.svg';
import xIcon from '../../../assets/svg/x.svg';

export const FooterSocial: FC = () => {
	return (
		<div className={css.container}>
			<div className={css.content}>
				<div className={css.text}>Feel free to slide into our DMs or send a letter</div>
				<ul className={css.social}>
					<Social icon={emailIcon} path="mailto:hi@lend.family" />
					<Social
						icon={discordIcon}
						path="https://discord.gg/U6qB3h6mbw"
						target="_blank"
						rel="noopener noreferrer"
					/>
					<Social icon={xIcon} path="https://x.com/lend_fam" target="_blank" rel="noopener noreferrer" />
				</ul>
			</div>
		</div>
	);
};

interface SocialProps {
	icon: string;
	path: string;
	target?: string;
	rel?: string;
}

const Social = memo<SocialProps>((props) => {
	const { icon, path, target, rel } = props;

	return (
		<li className={css.social_item}>
			<Link href={path} target={target} rel={rel}>
				<Icon src={icon} className={iconCss.container} />
			</Link>
		</li>
	);
});

Social.displayName = 'Social';
