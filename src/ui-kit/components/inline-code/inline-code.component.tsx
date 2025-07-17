import { type FC, type ReactNode } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';
import { useTheme } from '../../hooks/use-theme.hook';

import css from './inline-code.module.css';

interface InlineCodeProps {
	children: ReactNode;
	className?: string;
	theme?: {
		container?: string;
	};
}

const InlineCodeComponent: FC<InlineCodeProps> = ({ children, className, theme }) => {
	const styles = useTheme(css, theme);

	return <code className={[styles.container, className].filter(Boolean).join(' ')}>{children}</code>;
};

export const InlineCode = typedMemo(InlineCodeComponent);
