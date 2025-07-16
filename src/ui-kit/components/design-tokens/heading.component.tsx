import React from 'react';
import { ds } from '../../../utils/design-system';
import type { HeadingProps } from './types';

export const Heading: React.FC<HeadingProps> = ({ 
  variant = 'h1', 
  color = 'text.default',
  backgroundColor,
  as,
  className,
  style,
  children,
  ...props 
}) => {
  // Default element mapping
  const defaultElement = variant === 'title' ? 'h1' :
                         variant === 'menu' || variant === 'menu_active' ? 'div' :
                         variant as keyof React.JSX.IntrinsicElements;
  
  const Component = as || defaultElement;
  const typographyToken = `heading.desktop.${variant}` as const;
  
  const computedStyle = ds.createStyle({
    color,
    backgroundColor,
    typography: typographyToken,
    additional: style,
  });
  
  return (
    <Component 
      className={className}
      style={computedStyle}
      {...props}
    >
      {children}
    </Component>
  );
};