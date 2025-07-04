import { useMemo } from 'react';
import cn from 'classnames';

export const useTheme = <T extends Record<string, string>>(cssTheme: T, propsTheme?: Partial<T>): T =>
	useMemo(() => {
		if (propsTheme) {
			return Object.keys(propsTheme).reduce(
				(acc, item) => ({ ...acc, [item]: cn(cssTheme[item], propsTheme[item]) }),
				cssTheme,
			);
		}
		return cssTheme;
	}, [cssTheme, propsTheme]);
