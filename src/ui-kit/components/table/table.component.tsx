import { createElement, type ComponentType, type CSSProperties } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';
import { TableColumn, type TableAlign } from './table-column.component';
import { useTheme } from '../../hooks/use-theme.hook';

import css from './table.module.css';

export type TableData<D extends object> = {
	[K in keyof D]: D[K];
};

export interface TableHeadColumnRendererProps {
	align?: TableAlign;
	style?: CSSProperties;
}

export interface TableColumnRendererProps<D extends object = object> {
	value: string;
	data: D;
	align?: TableAlign;
	columnIndex: number;
	rowIndex: number;
	className?: string;
	columnHeight?: CSSProperties['height'];
	columnWidth?: CSSProperties['width'];
	style?: CSSProperties;
}

export interface TableColumnProps<D extends object, C extends keyof D> {
	key: C;
	label: string;
	align?: TableAlign;
	headCellRenderer?: ComponentType<TableHeadColumnRendererProps>;
	cellRenderer?: ComponentType<TableColumnRendererProps<D>>;
	height?: CSSProperties['height'];
	width?: CSSProperties['width'];
}

interface TableProps<D extends object, C extends keyof D> {
	columns: TableColumnProps<D, C>[];
	data: TableData<D>[];
	theme?: Partial<typeof css>;
	columnWidth?: CSSProperties['width'];
	columnHeight?: CSSProperties['height'];
}

export const Table = typedMemo(<C extends keyof D, D extends object>(props: TableProps<D, C>) => {
	const { columns, data, columnHeight, columnWidth } = props;

	const theme = useTheme(css, props.theme);

	return (
		<div className={theme.container}>
			<div className={theme.header}>
				{columns.map((column) => {
					const style = { width: column.width || columnWidth };

					if (column.headCellRenderer) {
						return createElement(column.headCellRenderer, {
							key: String(column.key),
							align: column.align || 'left',
							style,
						});
					}

					return (
						<TableColumn key={String(column.key)} align={column.align} style={style}>
							{column.label}
						</TableColumn>
					);
				})}
			</div>
			{data.map((data, index) => (
				<TableRaw
					key={index}
					data={data}
					columns={columns}
					columnHeight={columnHeight}
					columnWidth={columnWidth}
					index={index}
					theme={theme}
				/>
			))}
		</div>
	);
});

interface TableRawProps<D extends object, C extends keyof D> {
	data: TableData<D>;
	index: number;
	columns: TableColumnProps<D, C>[];
	columnWidth: CSSProperties['width'];
	columnHeight: CSSProperties['height'];
	theme: typeof css;
}

const TableRaw = typedMemo(<C extends keyof D, D extends object>(props: TableRawProps<D, C>) => {
	const { data, columns, columnHeight, columnWidth, index, theme } = props;

	return (
		<div className={theme.row}>
			{columns.map((column) => {
				const style = { height: column.height || columnHeight, width: column.width || columnWidth };

				if (column.cellRenderer) {
					return createElement(column.cellRenderer, {
						key: `${index}_${String(column.key)}`,
						value: String(data[column.key]),
						data,
						columnIndex: index,
						rowIndex: index,
						align: column.align,
						style,
					});
				}
				return (
					<TableColumn key={`${index}_${String(column.key)}`} align={column.align} style={style}>
						{String(data[column.key])}
					</TableColumn>
				);
			})}
		</div>
	);
});
