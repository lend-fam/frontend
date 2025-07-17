import designTokens from '../../design-tokens.tokens.json';

export interface DesignTokens {
	color: {
		white: string;
		dark: string;
		accent: {
			miracle_1: string;
			miracle_2: string;
			miracle_3: string;
			green: string;
			pink: string;
			ice: string;
			apechain: string;
			orange: string;
		};
		text: {
			inversion: string;
			default: string;
		};
		bg: {
			miracle_blue: string;
			miracle_blue_dark: string;
			miracle_blue_light: string;
		};
	};
	typography: {
		heading: {
			desktop: {
				title: FontStyle;
				h1: FontStyle;
				h2: FontStyle;
				h3: FontStyle;
				h4: FontStyle;
				h5: FontStyle;
				h6: FontStyle;
				menu: FontStyle;
				menu_active: FontStyle;
			};
		};
		text: {
			desktop: {
				default: FontStyle;
				small: FontStyle;
				default_bold: FontStyle;
				small_bold: FontStyle;
			};
		};
	};
}

export interface FontStyle {
	fontSize: number;
	textDecoration: string;
	fontFamily: string;
	fontWeight: number;
	fontStyle: string;
	fontStretch: string;
	letterSpacing: number;
	lineHeight: number;
	paragraphIndent: number;
	paragraphSpacing: number;
	textCase: string;
}

// Helper function to extract color value from token
function getColorValue(token: { value: string }): string {
	return token.value;
}

// Helper function to extract font values from token
function getFontValue(token: { value: FontStyle }): FontStyle {
	return token.value;
}

// Process design tokens into a more usable format
export const tokens: DesignTokens = {
	color: {
		white: getColorValue(designTokens.color.white),
		dark: getColorValue(designTokens.color.dark),
		accent: {
			miracle_1: getColorValue(designTokens.color.accent.miracle_1),
			miracle_2: getColorValue(designTokens.color.accent.miracle_2),
			miracle_3: getColorValue(designTokens.color.accent.miracle_3),
			green: getColorValue(designTokens.color.accent.green),
			pink: getColorValue(designTokens.color.accent.pink),
			ice: getColorValue(designTokens.color.accent.ice),
			apechain: getColorValue(designTokens.color.accent.apechain),
			orange: getColorValue(designTokens.color.accent.orange),
		},
		text: {
			inversion: getColorValue(designTokens.color.text.inversion),
			default: getColorValue(designTokens.color.text.default),
		},
		bg: {
			miracle_blue: getColorValue(designTokens.color.bg.miracle_blue),
			miracle_blue_dark: getColorValue(designTokens.color.bg.miracle_blue_dark),
			miracle_blue_light: getColorValue(designTokens.color.bg.miracle_blue_light),
		},
	},
	typography: {
		heading: {
			desktop: {
				title: getFontValue(designTokens.font.heading.desktop.title),
				h1: getFontValue(designTokens.font.heading.desktop.h1),
				h2: getFontValue(designTokens.font.heading.desktop.h2),
				h3: getFontValue(designTokens.font.heading.desktop.h3),
				h4: getFontValue(designTokens.font.heading.desktop.h4),
				h5: getFontValue(designTokens.font.heading.desktop.h5),
				h6: getFontValue(designTokens.font.heading.desktop.h6),
				menu: getFontValue(designTokens.font.heading.desktop.menu),
				menu_active: getFontValue(designTokens.font.heading.desktop.menu_active),
			},
		},
		text: {
			desktop: {
				default: getFontValue(designTokens.font.text.desktop.default),
				small: getFontValue(designTokens.font.text.desktop.small),
				default_bold: getFontValue(designTokens.font.text.desktop.default_bold),
				small_bold: getFontValue(designTokens.font.text.desktop.small_bold),
			},
		},
	},
};

// Generate CSS custom properties
export function generateCSSCustomProperties(): string {
	const cssVars: string[] = [];

	// Color variables
	cssVars.push('  /* Colors */');
	cssVars.push(`  --color-white: ${tokens.color.white};`);
	cssVars.push(`  --color-dark: ${tokens.color.dark};`);

	// Accent colors
	cssVars.push('  /* Accent Colors */');
	Object.entries(tokens.color.accent).forEach(([key, value]) => {
		cssVars.push(`  --color-accent-${key.replace('_', '-')}: ${value};`);
	});

	// Text colors
	cssVars.push('  /* Text Colors */');
	Object.entries(tokens.color.text).forEach(([key, value]) => {
		cssVars.push(`  --color-text-${key}: ${value};`);
	});

	// Background colors
	cssVars.push('  /* Background Colors */');
	Object.entries(tokens.color.bg).forEach(([key, value]) => {
		cssVars.push(`  --color-bg-${key.replace('_', '-')}: ${value};`);
	});

	// Typography variables
	cssVars.push('  /* Typography - Headings */');
	Object.entries(tokens.typography.heading.desktop).forEach(([key, value]) => {
		const prefix = `--font-heading-${key.replace('_', '-')}`;
		cssVars.push(`  ${prefix}-size: ${value.fontSize}px;`);
		cssVars.push(`  ${prefix}-family: ${value.fontFamily};`);
		cssVars.push(`  ${prefix}-weight: ${value.fontWeight};`);
		cssVars.push(`  ${prefix}-line-height: ${value.lineHeight}px;`);
		cssVars.push(`  ${prefix}-letter-spacing: ${value.letterSpacing}px;`);
	});

	// Text typography
	cssVars.push('  /* Typography - Text */');
	Object.entries(tokens.typography.text.desktop).forEach(([key, value]) => {
		const prefix = `--font-text-${key.replace('_', '-')}`;
		cssVars.push(`  ${prefix}-size: ${value.fontSize}px;`);
		cssVars.push(`  ${prefix}-family: ${value.fontFamily};`);
		cssVars.push(`  ${prefix}-weight: ${value.fontWeight};`);
		cssVars.push(`  ${prefix}-line-height: ${value.lineHeight}px;`);
		cssVars.push(`  ${prefix}-letter-spacing: ${value.letterSpacing}px;`);
	});

	return `:root {\n${cssVars.join('\n')}\n}`;
}

// Utility functions for accessing design tokens
export const designSystem = {
	color: {
		get: (path: string) => {
			const keys = path.split('.');
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let value: any = tokens.color;
			for (const key of keys) {
				value = value[key];
				if (value === undefined) break;
			}
			return value;
		},
		white: tokens.color.white,
		dark: tokens.color.dark,
		accent: tokens.color.accent,
		text: tokens.color.text,
		bg: tokens.color.bg,
	},
	typography: {
		get: (path: string) => {
			const keys = path.split('.');
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let value: any = tokens.typography;
			for (const key of keys) {
				value = value[key];
				if (value === undefined) break;
			}
			return value;
		},
		heading: tokens.typography.heading,
		text: tokens.typography.text,
	},
};

// Helper function to create CSS styles from font tokens
export function createFontStyles(fontToken: FontStyle): React.CSSProperties {
	return {
		fontSize: `${fontToken.fontSize}px`,
		fontFamily: fontToken.fontFamily,
		fontWeight: fontToken.fontWeight,
		lineHeight: `${fontToken.lineHeight}px`,
		letterSpacing: `${fontToken.letterSpacing}px`,
		fontStyle: fontToken.fontStyle,
		textDecoration: fontToken.textDecoration,
		textTransform: fontToken.textCase as React.CSSProperties['textTransform'],
	};
}
