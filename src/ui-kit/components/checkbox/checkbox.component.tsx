import { memo } from 'react';

export type CheckboxProps = JSX.IntrinsicElements['input'];

export const Checkbox = memo<CheckboxProps>((props) => {
	return <input {...props} />;
});

Checkbox.displayName = 'Checkbox';
