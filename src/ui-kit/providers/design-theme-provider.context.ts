import { createContext } from 'react';
import type { ColorToken, TypographyToken } from '../../utils/design-system';
import { ds } from '../../utils/design-system';

// Theme context types
export type ThemeMode = 'light' | 'dark';

export interface DesignThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  
  // Design token accessors
  color: typeof ds.color;
  typography: typeof ds.typography;
  
  // Theme-aware helpers
  getColor: (token: ColorToken) => string;
  getTypography: (token: TypographyToken) => React.CSSProperties;
  
  // Current theme colors
  currentTheme: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
  };
}

export const DesignThemeContext = createContext<DesignThemeContextValue | undefined>(undefined);