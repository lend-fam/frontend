import type { FC } from 'react';
import { Icon } from '../../../ui-kit/components/icon/icon.component';

import css from './footer-content.module.css';

import sloganIcon from '../../../assets/svg/slogan.svg';

export const FooterContent: FC = () => {
	return (
		<div className={css.container}>
			<p className={css.description}>Together strong</p>
			<p className={css.text}>Lend, borrow, and earn with your NFT fam</p>
    		<Icon src={sloganIcon} />
		</div>
	);
};
