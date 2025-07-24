import { useContext } from 'react';
import { AnalyticsContext } from '../contexts/analytics.context';
import type { AnalyticsContextType } from '../contexts/analytics.context';

export const useAnalyticsContext = (): AnalyticsContextType => {
	const context = useContext(AnalyticsContext);
	if (context === undefined) {
		throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
	}
	return context;
};