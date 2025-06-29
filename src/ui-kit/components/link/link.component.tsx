import { memo, type JSX } from 'react';

type LinkProps = JSX.IntrinsicElements['a'];

export const Link = memo<LinkProps>((props) => {
	return <a {...props} />;
});

Link.displayName = 'Link';
