import { memo } from 'react';
import { TableColumn } from '../../table-column.component';
import type { TableColumnRendererProps } from '../../table.component';

import css from './assets-column.module.css';

import coinIcon from '../../../../../assets/svg/coin.svg';

export const AssetsColumn = memo<TableColumnRendererProps>((props) => {
	const { align, className, style } = props;

	return (
		<TableColumn align={align} className={className} style={style}>
			<img src={coinIcon} className={css.icon} />
			<span>ApeCoin</span>
		</TableColumn>
	);
});

AssetsColumn.displayName = 'AssetsColumn';
