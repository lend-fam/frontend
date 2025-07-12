import { memo, type PropsWithChildren } from 'react';
import { useTheme } from '../../ui-kit';

import css from './layout.module.css';

interface LayoutProps extends PropsWithChildren {
	theme?: Partial<typeof css>;
}

export const Layout = memo<LayoutProps>((props) => {
	const theme = useTheme(css, props.theme);

	return (
		<div className={theme.container}>
			<div className={theme.content}>{props.children}</div>
		</div>
	);
});

Layout.displayName = 'Layout';
