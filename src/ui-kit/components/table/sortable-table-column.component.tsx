import { memo, useMemo } from 'react';
import cn from 'classnames';
import { TableColumn } from './table-column.component';
import { useTheme } from '../../hooks/use-theme.hook';
import type { TableHeadColumnRendererProps } from './table.component';

import css from './sortable-table-column.module.css';

interface SortableTableColumnProps<C extends string | number | symbol> extends TableHeadColumnRendererProps<C> {
	column: C;
	label: string;
	theme?: Partial<typeof css>;
}

export const SortableTableColumn = memo(<C extends string | number | symbol>(props: SortableTableColumnProps<C>) => {
	const { column, label, align = 'left', style, sortState, onSort, sortable = true } = props;

	const theme = useTheme(css, props.theme);

	const isActive = sortState?.column === column;
	const direction = isActive ? sortState.direction : null;

	const handleClick = () => {
		if (!sortable || !onSort) return;
		onSort(column);
	};

	const sortIcon = useMemo(() => {
		if (!sortable) return null;

		if (direction === 'asc') {
			return '↑';
		} else if (direction === 'desc') {
			return '↓';
		}
		return '↕';
	}, [direction, sortable]);

	const className = useMemo(
		() =>
			cn(theme.container, {
				[css.sortable]: sortable,
				[css.active]: isActive,
			}),
		[theme.container, sortable, isActive],
	);

	return (
		<TableColumn align={align} style={style} className={className} onClick={handleClick}>
			<div className={theme.content}>
				<span className={theme.label}>{label}</span>
				{sortable && <span className={theme.icon}>{sortIcon}</span>}
			</div>
		</TableColumn>
	);
});

SortableTableColumn.displayName = '<SortableTableColumn>';

// eslint-disable-next-line react-refresh/only-export-components
export const createSortableColumnRenderer = <C extends string | number | symbol>(column: C, label: string) => {
	const SortableColumnRenderer = (props: TableHeadColumnRendererProps<C>) => (
		<SortableTableColumn {...props} column={column} label={label} />
	);
	SortableColumnRenderer.displayName = `SortableColumnRenderer(${String(column)})`;
	return SortableColumnRenderer;
};
