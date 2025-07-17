import { tokens, createFontStyles } from './design-tokens';
import type { FontStyle } from './design-tokens';

// Type-safe design token access utilities
export type ColorToken =
	| 'white'
	| 'dark'
	| 'accent.miracle_1'
	| 'accent.miracle_2'
	| 'accent.miracle_3'
	| 'accent.green'
	| 'accent.pink'
	| 'accent.ice'
	| 'accent.apechain'
	| 'accent.orange'
	| 'text.inversion'
	| 'text.default'
	| 'bg.miracle_blue'
	| 'bg.miracle_blue_dark'
	| 'bg.miracle_blue_light';

export type TypographyToken =
	| 'heading.desktop.title'
	| 'heading.desktop.h1'
	| 'heading.desktop.h2'
	| 'heading.desktop.h3'
	| 'heading.desktop.h4'
	| 'heading.desktop.h5'
	| 'heading.desktop.h6'
	| 'heading.desktop.menu'
	| 'heading.desktop.menu_active'
	| 'text.desktop.default'
	| 'text.desktop.small'
	| 'text.desktop.default_bold'
	| 'text.desktop.small_bold';

// Helper function to get nested object value by path
function getNestedValue(obj: unknown, path: string): unknown {
	return path.split('.').reduce((current, key) => (current as Record<string, unknown>)?.[key], obj);
}

// Color utilities
export const color = {
	/**
	 * Get a color value by token path
	 */
	get: (token: ColorToken): string => {
		const value = getNestedValue(tokens.color, token);
		if (!value) {
			console.warn(`Color token "${token}" not found`);
			return '#000000';
		}
		return value as string;
	},

	/**
	 * Get CSS custom property for a color token
	 */
	css: (token: ColorToken): string => {
		const cssPath = token.replace(/\./g, '-').replace(/_/g, '-');
		return `var(--color-${cssPath})`;
	},

	// Direct access to color categories
	white: tokens.color.white,
	dark: tokens.color.dark,
	accent: tokens.color.accent,
	text: tokens.color.text,
	bg: tokens.color.bg,
};

// Typography utilities
export const typography = {
	/**
	 * Get typography values by token path
	 */
	get: (token: TypographyToken): FontStyle => {
		const value = getNestedValue(tokens.typography, token);
		if (!value) {
			console.warn(`Typography token "${token}" not found`);
			return tokens.typography.text.desktop.default;
		}
		return value as FontStyle;
	},

	/**
	 * Get CSS styles object for a typography token
	 */
	styles: (token: TypographyToken): React.CSSProperties => {
		const fontToken = typography.get(token);
		return createFontStyles(fontToken);
	},

	/**
	 * Get CSS custom property for a typography token
	 */
	css: (
		token: TypographyToken,
		property: 'size' | 'family' | 'weight' | 'line-height' | 'letter-spacing',
	): string => {
		const cssPath = token.replace(/\./g, '-').replace(/_/g, '-');
		return `var(--font-${cssPath}-${property})`;
	},

	// Direct access to typography categories
	heading: tokens.typography.heading,
	text: tokens.typography.text,
};

// Design system utilities
export const ds = {
	color,
	typography,

	/**
	 * Create a complete style object with color and typography
	 */
	createStyle: (options: {
		color?: ColorToken;
		backgroundColor?: ColorToken;
		typography?: TypographyToken;
		additional?: React.CSSProperties;
	}): React.CSSProperties => {
		const styles: React.CSSProperties = {};

		if (options.color) {
			styles.color = color.get(options.color);
		}

		if (options.backgroundColor) {
			styles.backgroundColor = color.get(options.backgroundColor);
		}

		if (options.typography) {
			Object.assign(styles, typography.styles(options.typography));
		}

		if (options.additional) {
			Object.assign(styles, options.additional);
		}

		return styles;
	},
};

// CSS-in-JS helpers for styled-components or emotion
export const styled = {
	/**
	 * Generate CSS template literal for color
	 */
	color: (token: ColorToken) => color.css(token),

	/**
	 * Generate CSS template literal for typography
	 */
	typography: (token: TypographyToken) => {
		const fontToken = typography.get(token);
		return `
      font-size: ${fontToken.fontSize}px;
      font-family: ${fontToken.fontFamily};
      font-weight: ${fontToken.fontWeight};
      line-height: ${fontToken.lineHeight}px;
      letter-spacing: ${fontToken.letterSpacing}px;
    `;
	},
};

// Theme variants (for future dark mode support)
export const theme = {
	light: {
		background: color.get('white'),
		text: color.get('text.default'),
		primary: color.get('accent.miracle_1'),
		secondary: color.get('accent.ice'),
	},
	dark: {
		background: color.get('dark'),
		text: color.get('text.inversion'),
		primary: color.get('accent.miracle_1'),
		secondary: color.get('accent.ice'),
	},
};

// Export commonly used combinations
export const commonStyles = {
	// Button styles
	primaryButton: ds.createStyle({
		color: 'text.inversion',
		backgroundColor: 'accent.miracle_1',
		typography: 'text.desktop.default_bold',
	}),

	secondaryButton: ds.createStyle({
		color: 'text.default',
		backgroundColor: 'accent.ice',
		typography: 'text.desktop.default_bold',
	}),

	// Text styles
	title: ds.createStyle({
		color: 'text.default',
		typography: 'heading.desktop.title',
	}),

	h1: ds.createStyle({
		color: 'text.default',
		typography: 'heading.desktop.h1',
	}),

	h2: ds.createStyle({
		color: 'text.default',
		typography: 'heading.desktop.h2',
	}),

	bodyText: ds.createStyle({
		color: 'text.default',
		typography: 'text.desktop.default',
	}),

	smallText: ds.createStyle({
		color: 'text.default',
		typography: 'text.desktop.small',
	}),

	// Status colors
	success: ds.createStyle({
		color: 'accent.green',
	}),

	warning: ds.createStyle({
		color: 'accent.orange',
	}),

	error: ds.createStyle({
		color: 'accent.pink',
	}),
};

export default ds;
