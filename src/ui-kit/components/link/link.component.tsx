import { memo, type JSX } from 'react';
import { Link as RouterLink } from 'react-router-dom';

type LinkProps = JSX.IntrinsicElements['a'] & {
	to?: string;
};

export const Link = memo<LinkProps>((props) => {
	const { to, href, ...rest } = props;

	// If 'to' prop is provided, use React Router Link
	if (to) {
		return <RouterLink to={to} {...rest} />;
	}

	// Otherwise use regular anchor tag (for external links)
	return <a href={href} {...rest} />;
});

Link.displayName = 'Link';
