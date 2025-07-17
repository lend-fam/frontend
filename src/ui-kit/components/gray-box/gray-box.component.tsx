import { type FC, type ReactNode } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';

import css from './gray-box.module.css';

interface GrayBoxProps {
	children: ReactNode;
	className?: string;
	theme?: {
		container?: string;
	};
}

const GrayBoxComponent: FC<GrayBoxProps> = ({ children, className, theme }) => {
	const styles = useTheme(css, theme);

	return <div className={[styles.container, className].filter(Boolean).join(' ')}>{children}</div>;
};

export const GrayBox = typedMemo(GrayBoxComponent);
