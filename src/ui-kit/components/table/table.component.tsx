import { createElement, type ComponentType } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';
import { TableColumn, type TableAlign } from './table-column.component';

import css from './table.module.css';

export type TableData<D extends object> = {
	[K in keyof D]: D[K];
};

export interface TableHeadColumnRendererProps {
	align?: TableAlign;
}

export interface TableColumnRendererProps<D extends object = object> {
	value: string;
	data: D;
	align?: TableAlign;
	columnIndex: number;
	rowIndex: number;
	className?: string;
}

export interface TableColumnProps<D extends object, C extends string> {
	key: C;
	label: string;
	align?: TableAlign;
	headCellRenderer?: ComponentType<TableHeadColumnRendererProps>;
	cellRenderer?: ComponentType<TableColumnRendererProps<D>>;
}

interface TableProps<D extends object, C extends string> {
	columns: TableColumnProps<D, C>[];
	data: TableData<D>[];
}

export const Table = typedMemo(<C extends string, D extends object>(props: TableProps<D, C>) => {
	const { columns, data } = props;

	return (
		<div className={css.container}>
			{columns.map((column) => {
				if (column.headCellRenderer) {
					createElement(column.headCellRenderer, { key: column.key, align: column.align || 'left' });
				}

				return (
					<TableColumn key={column.key} align={column.align}>
						{column.label}
					</TableColumn>
				);
			})}
			{data.map((data, index) => (
				<TableRaw key={index} data={data} columns={columns} index={index} />
			))}
		</div>
	);
});

interface TableRawProps<D extends object, C extends string> {
	data: TableData<D>;
	index: number;
	columns: TableColumnProps<D, C>[];
}

const TableRaw = typedMemo(<C extends string, D extends object>(props: TableRawProps<D, C>) => {
	const { data, columns, index } = props;

	return (
		<>
			{columns.map((column) => {
				if (column.cellRenderer) {
					return createElement(column.cellRenderer, {
						key: `${index}_${column.key}`,
						value: data[column.key],
						data,
						columnIndex: index,
						rowIndex: index,
						align: column.align,
					});
				}
				return (
					<TableColumn key={`${index}_${column.key}`} align={column.align}>
						<>{data[column.key]}</>
					</TableColumn>
				);
			})}
		</>
	);
});
