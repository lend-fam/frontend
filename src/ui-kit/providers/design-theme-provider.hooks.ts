import { useContext, useMemo } from 'react';
import { DesignThemeContext, type DesignThemeContextValue } from './design-theme-provider.context';

// Hook to use design theme
export const useDesignTheme = (): DesignThemeContextValue => {
  const context = useContext(DesignThemeContext);
  if (!context) {
    throw new Error('useDesignTheme must be used within a DesignThemeProvider');
  }
  return context;
};

// Enhanced theme hook that works with both CSS modules and design tokens
export const useEnhancedTheme = <T extends Record<string, string>>(
  cssTheme: T, 
  propsTheme?: Partial<T>
): T & { designTokens: DesignThemeContextValue } => {
  const designTokens = useDesignTheme();
  
  const enhancedTheme = useMemo(() => {
    if (propsTheme) {
      return Object.keys(propsTheme).reduce(
        (acc, item) => ({ 
          ...acc, 
          [item]: `${cssTheme[item]} ${propsTheme[item]}`.trim()
        }),
        cssTheme,
      );
    }
    return cssTheme;
  }, [cssTheme, propsTheme]);
  
  return {
    ...enhancedTheme,
    designTokens,
  };
};