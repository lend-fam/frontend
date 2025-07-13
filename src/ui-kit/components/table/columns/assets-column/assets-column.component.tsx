import { memo } from 'react';
import { TableColumn } from '../../table-column.component';
import type { TableColumnRendererProps } from '../../table.component';
import { Icon } from '../../../icon/icon.component';

import css from './assets-column.module.css';
import coinIcon from '../../../../../assets/svg/coin.svg';

export const AssetsColumn = memo<TableColumnRendererProps & { onClick?: () => void }>((props) => {
	const { align, className, style, value, onClick } = props;

	return (
		<TableColumn align={align} className={className} style={style} onClick={onClick}>
			<Icon src={coinIcon} className={css.icon} />
			<span>{value || 'Unknown Asset'}</span>
		</TableColumn>
	);
});

AssetsColumn.displayName = 'AssetsColumn';
