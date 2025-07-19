import { memo, type JSX } from 'react';

export type IconProps = JSX.IntrinsicElements['img'];

export const Icon = memo<IconProps>((props) => {
	return <img {...props} />;
});

Icon.displayName = 'Icon';
