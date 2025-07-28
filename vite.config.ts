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
		build: {
			rollupOptions: {
				output: {
					manualChunks: {
						// Vendor chunk for heavy dependencies
						'vendor-web3': ['wagmi', 'viem', '@rainbow-me/rainbowkit', '@use-glyph/sdk-react'],
						'vendor-apollo': ['@apollo/client', 'graphql'],
						'vendor-react': ['react', 'react-dom', 'react-router-dom'],
						'vendor-query': ['@tanstack/react-query'],
						'vendor-charts': ['recharts'],
						'vendor-ui': ['classnames', 'posthog-js', '@marsidev/react-turnstile'],
					},
				},
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
