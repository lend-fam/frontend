import { memo, type JSX } from 'react';

type IconProps = JSX.IntrinsicElements['img'];

export const Icon = memo<IconProps>((props) => {
	return <img {...props} />;
});

Icon.displayName = 'Icon';
