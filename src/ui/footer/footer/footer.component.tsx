import type { FC } from 'react';
import { Layout } from '../../layout/layout.component';
import { FooterNavigationPanel } from '../footer-navigation-panel/footer-navigation-panel.component';
import { FooterContent } from '../footer-content/footer-content.component';

import css from './theme/footer.module.css';
import layoutCss from './theme/layout.child.module.css';

export const Footer: FC = () => {
	return (
		<div className={css.container}>
		    <div className={css.content}>
                <Layout theme={layoutCss}>
                    <FooterNavigationPanel />
                    <FooterContent />
                </Layout>
            </div>
		</div>
	);
};
