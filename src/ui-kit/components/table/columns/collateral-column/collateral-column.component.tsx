import { memo } from 'react';
import { TableColumn } from '../../table-column.component';
import { Button } from '../../../button/button.component';
import type { TableColumnRendererProps } from '../../table.component';

import css from './collateral-column.module.css';

export const CollateralColumn = memo<TableColumnRendererProps>((props) => {
	const { align, className, style } = props;

	return (
		<TableColumn align={align} className={className} style={style}>
			<div className={css.controls}>
				<Button className={css.withdraw_button}>Withdraw</Button>
				<Button className={css.supply_button}>Supply</Button>
			</div>
		</TableColumn>
	);
});

CollateralColumn.displayName = 'CollateralColumn';
