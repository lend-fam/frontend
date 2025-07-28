import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalyticsContext } from './use-analytics-context.hook';

/**
 * Hook that automatically tracks page views when route changes
 * Should be used at the app level to monitor route changes
 */
export const usePageAnalytics = () => {
	const location = useLocation();
	const { trackPage } = useAnalyticsContext();
	const prevLocationRef = useRef<string>('');

	useEffect(() => {
		const currentPath = location.pathname + location.search;
		const prevPath = prevLocationRef.current;

		// Track page view if location changed
		if (currentPath !== prevPath) {
			// Get page name from pathname
			const pageName = getPageNameFromPath(location.pathname);

			// Track the page view with additional context
			trackPage(pageName, {
				path: location.pathname,
				search: location.search,
				hash: location.hash,
				full_url: window.location.href,
			});

			// Update ref
			prevLocationRef.current = currentPath;
		}
	}, [location, trackPage]);

	return {
		currentPath: location.pathname,
		currentSearch: location.search,
		currentHash: location.hash,
	};
};

/**
 * Convert pathname to a readable page name for analytics
 */
function getPageNameFromPath(pathname: string): string {
	// Remove leading slash and split by '/'
	const segments = pathname.replace(/^\//, '').split('/').filter(Boolean);

	if (segments.length === 0) {
		return 'Landing Page';
	}

	switch (segments[0]) {
		case 'dashboard':
			return 'Dashboard';
		case 'markets':
			if (segments.length === 1) {
				return 'Markets Overview';
			} else if (segments.length === 2) {
				return 'Market Detail';
			}
			return 'Markets';
		case 'collections':
			if (segments.length === 1) {
				return 'Collections Overview';
			} else if (segments.length === 2) {
				return 'Collection Detail';
			}
			return 'Collections';
		case 'profile':
			return 'Profile';
		case 'faucet':
			return 'Faucet';
		default:
			// Capitalize first segment for unknown routes
			return segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
	}
}
