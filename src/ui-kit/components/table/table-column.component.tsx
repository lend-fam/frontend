import { memo, useMemo, type JSX } from 'react';
import cn from 'classnames';
import { useTheme } from '../../hooks/use-theme.hook';

import css from './table-column.module.css';

export type TableAlign = 'left' | 'center' | 'right';

type TableColumnProps = JSX.IntrinsicElements['div'] & {
	align?: TableAlign;
	theme?: Partial<typeof css>;
};

export const TableColumn = memo<TableColumnProps>((props) => {
	const { align = 'left', children, ...restProps } = props;

	const theme = useTheme(css, props.theme);

	const className = useMemo(
		() =>
			cn(theme.container, props.className, {
				[css.container_left]: align === 'left',
				[css.container_center]: align === 'center',
				[css.container_right]: align === 'right',
			}),
		[align, props.className, theme.container],
	);

	return (
		<div {...restProps} className={className}>
			<div className={theme.content}>{children}</div>
		</div>
	);
});

TableColumn.displayName = '<TableColumn>';
