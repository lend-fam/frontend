import React from 'react';
import { ds } from '../../../utils/design-system';
import type { BoxProps } from './types';

export const Box: React.FC<BoxProps> = ({
	color,
	backgroundColor,
	as: Component = 'div',
	className,
	style,
	children,
	...props
}) => {
	const computedStyle = ds.createStyle({
		color,
		backgroundColor,
		additional: style,
	});

	return (
		<Component className={className} style={computedStyle} {...props}>
			{children}
		</Component>
	);
};
