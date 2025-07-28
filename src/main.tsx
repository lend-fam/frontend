import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/app/app.component';

// Suppress expected buffer externalization warnings in development
if (import.meta.env.DEV) {
	const originalWarn = console.warn;
	console.warn = (...args) => {
		const message = args.join(' ');
		if (message.includes('Module "buffer" has been externalized for browser compatibility')) {
			// This is expected for Web3 libraries - suppress in development
			return;
		}
		originalWarn.apply(console, args);
	};
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
