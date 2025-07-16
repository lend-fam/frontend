import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
	globalIgnores(['dist', 'scripts']),
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			pluginReact.configs.flat.recommended,
			reactHooks.configs['recommended-latest'],
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	{
		rules: {
			// suppress errors for missing 'import React' in files
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			// allow jsx syntax in js files (for next.js project)
			'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }], //should add ".ts" if typescript project
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
]);
