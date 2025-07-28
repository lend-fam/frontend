import { type FC } from 'react';
import css from './coming-soon-page.module.css';
import { Link } from '../../ui-kit/components/link/link.component';
import { Icon } from '../../ui-kit/components/icon/icon.component';
import XIcon from '../../assets/svg/x.svg';
import DiscordIcon from '../../assets/svg/discord.svg';

interface ComingSoonPageProps {
	title?: string;
	description?: string;
}

export const ComingSoonPage: FC<ComingSoonPageProps> = () => {
	return (
		<div className={css.container}>
			<div className={css.content}>
				<div className={css.comingSoon}>Coming Soon</div>
				<p className={css.subtitle}>We&apos;re working hard to bring you something amazing!</p>
				<div className={css.socialsContainer}>
					<p className={css.followText}>Follow us for updates:</p>
					<div className={css.socialButtons}>
						<div className={css.socialButton}>
							<Link href="https://discord.gg/U6qB3h6mbw" target="_blank" rel="noopener noreferrer">
								<Icon src={DiscordIcon} />
							</Link>
						</div>
						<div className={css.socialButton}>
							<Link href="https://x.com/lend_fam" target="_blank" rel="noopener noreferrer">
								<Icon src={XIcon} />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
