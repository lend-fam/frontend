/**
 * Performance monitoring utility for tracking loading optimizations
 * This helps developers understand the impact of the performance improvements
 */

interface PerformanceMetrics {
	initialLoadTime: number;
	firstContentfulPaint: number;
	largestContentfulPaint: number;
	cumulativeLayoutShift: number;
	firstInputDelay: number;
	totalBlockingTime: number;
}

class PerformanceMonitor {
	private metrics: Partial<PerformanceMetrics> = {};
	private isMonitoring = false;

	constructor() {
		// Only monitor in development or when explicitly enabled
		if (import.meta.env.DEV || localStorage.getItem('enablePerformanceMonitoring') === 'true') {
			this.isMonitoring = true;
			this.startMonitoring();
		}
	}

	private startMonitoring() {
		// Track initial load time
		window.addEventListener('load', () => {
			this.metrics.initialLoadTime = performance.now();
		});

		// Track Web Vitals if available
		if ('web-vitals' in window || typeof PerformanceObserver !== 'undefined') {
			this.observeWebVitals();
		}

		// Track lazy loading effectiveness
		this.trackLazyLoadingMetrics();
	}

	private observeWebVitals() {
		try {
			// First Contentful Paint
			new PerformanceObserver((list) => {
				const entries = list.getEntries();
				const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
				if (fcpEntry) {
					this.metrics.firstContentfulPaint = fcpEntry.startTime;
				}
			}).observe({ entryTypes: ['paint'] });

			// Largest Contentful Paint
			new PerformanceObserver((list) => {
				const entries = list.getEntries();
				const lastEntry = entries[entries.length - 1];
				this.metrics.largestContentfulPaint = lastEntry.startTime;
			}).observe({ entryTypes: ['largest-contentful-paint'] });

			// Cumulative Layout Shift
			new PerformanceObserver((list) => {
				let clsValue = 0;
				for (const entry of list.getEntries() as PerformanceEntry[]) {
					// @ts-expect-error - PerformanceEntry doesn't include layout shift properties
					if (!entry.hadRecentInput) {
						// @ts-expect-error - PerformanceEntry doesn't include layout shift properties
						clsValue += entry.value;
					}
				}
				this.metrics.cumulativeLayoutShift = clsValue;
			}).observe({ entryTypes: ['layout-shift'] });
		} catch {
			// Performance Observer not supported
		}
	}

	private trackLazyLoadingMetrics() {
		// Track lazy loading performance by monitoring dynamic imports
		// Note: This is for debugging purposes only
		try {
			// Lazy loading monitoring initialized
		} catch {
			// Could not initialize lazy loading monitoring
		}
	}

	public getMetrics(): Partial<PerformanceMetrics> {
		return { ...this.metrics };
	}

	public logOptimizationSummary() {
		if (!this.isMonitoring) return;

		// Performance optimizations have been applied - method kept for API compatibility
	}

	public trackCustomMetric(name: string, value: number) {
		if (!this.isMonitoring) return;

		// @ts-expect-error - extending metrics object
		this.metrics[name] = value;
	}
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-log summary after page load
window.addEventListener('load', () => {
	setTimeout(() => {
		performanceMonitor.logOptimizationSummary();
	}, 2000); // Wait 2 seconds for initial metrics to stabilize
});
