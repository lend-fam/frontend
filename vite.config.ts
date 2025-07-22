import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { patchCssModules } from 'vite-css-modules';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(() => {
	return {
		base: '/',
		plugins: [react(), patchCssModules({ generateSourceTypes: true })],
		resolve: {
			alias: {
				// Force Glyph SDK to use the same React instance
				react: path.resolve('./node_modules/react'),
				'react-dom': path.resolve('./node_modules/react-dom'),
			},
		},
		optimizeDeps: {
			// Include Glyph SDK in dependency pre-bundling
			include: ['@use-glyph/sdk-react'],
		},
	};
});
