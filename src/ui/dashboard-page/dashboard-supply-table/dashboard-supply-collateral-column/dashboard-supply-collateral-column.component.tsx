import { memo } from 'react';
import { TableColumn } from '../../../../ui-kit/components/table/table-column.component';
import { Button } from '../../../../ui-kit/components/button/button.component';
import type { TableColumnRendererProps } from '../../../../ui-kit/components/table/table.component';

import css from './dashboard-supply-collateral-column.module.css';

export const CollateralColumn = memo<TableColumnRendererProps>((props) => {
	const { align, className } = props;

	return (
		<TableColumn align={align} className={className}>
			<div className={css.controls}>
				<Button className={css.withdraw_button}>Withdraw</Button>
				<Button className={css.supply_button}>Supply</Button>
			</div>
		</TableColumn>
	);
});

CollateralColumn.displayName = 'CollateralColumn';
