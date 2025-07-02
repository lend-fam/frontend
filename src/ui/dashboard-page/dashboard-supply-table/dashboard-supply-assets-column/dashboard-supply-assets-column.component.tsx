import { memo } from 'react';
import { TableColumn } from '../../../../ui-kit/components/table/table-column.component';
import type { TableColumnRendererProps } from '../../../../ui-kit/components/table/table.component';

import coinIcon from '../../../../assets/svg/coin.svg';

export const AssetsColumn = memo<TableColumnRendererProps>((props) => {
	const { align, className } = props;

	return (
		<TableColumn align={align} className={className}>
			<img src={coinIcon} />
			<span>ApeCoin</span>
		</TableColumn>
	);
});

AssetsColumn.displayName = 'AssetsColumn';
