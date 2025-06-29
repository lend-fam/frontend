import type { FC, PropsWithChildren } from 'react';

import css from './layout.module.css';

export const Layout: FC<PropsWithChildren> = (props) => <div className={css.container}>{props.children}</div>;
