import React from 'react';
import { ds } from '../../../utils/design-system';
import type { TextProps } from './types';

export const Text: React.FC<TextProps> = ({
	variant = 'default',
	color = 'text.default',
	backgroundColor,
	as: Component = 'p',
	className,
	style,
	children,
	...props
}) => {
	const typographyToken = `text.desktop.${variant}` as const;

	const computedStyle = ds.createStyle({
		color,
		backgroundColor,
		typography: typographyToken,
		additional: style,
	});

	return (
		<Component className={className} style={computedStyle} {...props}>
			{children}
		</Component>
	);
};
