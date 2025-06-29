import { memo, useMemo, type JSX } from 'react';
import cn from 'classnames';

import css from './button.module.css';

type ButtonProps = JSX.IntrinsicElements['button'];

export const Button = memo<ButtonProps>((props) => {
	const className = useMemo(() => cn(css.container, props.className), [props.className]);
	return <button {...props} className={className} />;
});

Button.displayName = 'Button';
