import React, { useMemo, useState } from 'react';
import { ds } from '../../utils/design-system';
import type { ColorToken, TypographyToken } from '../../utils/design-system';
import { DesignThemeContext, type DesignThemeContextValue, type ThemeMode } from './design-theme-provider.context';

export interface DesignThemeProviderProps {
	children: React.ReactNode;
	defaultMode?: ThemeMode;
}

export const DesignThemeProvider: React.FC<DesignThemeProviderProps> = ({ children, defaultMode = 'light' }) => {
	const [mode, setMode] = useState<ThemeMode>(defaultMode);

	const currentTheme = useMemo(() => {
		return {
			background: mode === 'light' ? ds.color.get('white') : ds.color.get('dark'),
			text: mode === 'light' ? ds.color.get('text.default') : ds.color.get('text.inversion'),
			primary: ds.color.get('accent.miracle_1'),
			secondary: ds.color.get('accent.ice'),
		};
	}, [mode]);

	const getColor = useMemo(() => {
		return (token: ColorToken): string => {
			// For theme-aware colors, we can add logic here to return different values based on mode
			// For now, we'll just return the token value
			return ds.color.get(token);
		};
	}, []);

	const getTypography = useMemo(() => {
		return (token: TypographyToken): React.CSSProperties => {
			return ds.typography.styles(token);
		};
	}, []);

	const value = useMemo<DesignThemeContextValue>(
		() => ({
			mode,
			setMode,
			color: ds.color,
			typography: ds.typography,
			getColor,
			getTypography,
			currentTheme,
		}),
		[mode, getColor, getTypography, currentTheme],
	);

	return <DesignThemeContext.Provider value={value}>{children}</DesignThemeContext.Provider>;
};
