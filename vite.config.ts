import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { patchCssModules } from 'vite-css-modules';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	// Set base path based on build mode
	const base = mode === 'develop' ? '/development/' : '/';

	return {
		base,
		plugins: [react(), patchCssModules({ generateSourceTypes: true })],
		resolve: {
			alias: {
				// Force Glyph SDK to use the same React instance
				react: path.resolve('./node_modules/react'),
				'react-dom': path.resolve('./node_modules/react-dom'),
			},
		},
		define: {
			// Polyfills for Node.js modules in browser
			global: 'globalThis',
		},
		optimizeDeps: {
			// Include heavy dependencies in pre-bundling for faster dev server startup
			include: [
				'@use-glyph/sdk-react',
				'@apollo/client',
				'graphql',
				'@tanstack/react-query',
				'recharts',
				'posthog-js',
				'@marsidev/react-turnstile',
				'classnames',
			],
		},
		// Browser caching strategy
		server: {
			headers: {
				// Cache static assets aggressively
				'Cache-Control': 'public, max-age=31536000', // 1 year for static assets
			},
		},
		build: {
			rollupOptions: {
				onwarn(warning, warn) {
					// Suppress PURE annotation warnings from nested viem dependencies
					if (warning.code === 'INVALID_ANNOTATION' && warning.message?.includes('/*#__PURE__*/')) {
						return;
					}
					warn(warning);
				},
			},
		},
	};
});