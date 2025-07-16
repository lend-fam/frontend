import type { ColorToken } from '../../../utils/design-system';

export interface BaseDesignTokenProps {
  color?: ColorToken;
  backgroundColor?: ColorToken;
  className?: string;
  style?: React.CSSProperties;
}

export interface TextProps extends BaseDesignTokenProps {
  variant?: 'default' | 'small' | 'default_bold' | 'small_bold';
  as?: 'p' | 'span' | 'div';
  children: React.ReactNode;
}

export interface HeadingProps extends BaseDesignTokenProps {
  variant?: 'title' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'menu' | 'menu_active';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  children: React.ReactNode;
}

export interface BoxProps extends BaseDesignTokenProps {
  as?: keyof React.JSX.IntrinsicElements;
  children?: React.ReactNode;
}