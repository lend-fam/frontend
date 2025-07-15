import type { FC } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileComponentProps {
	onSuccess: (token: string) => void;
	onError?: () => void;
	onExpire?: () => void;
	theme?: 'light' | 'dark' | 'auto';
	size?: 'normal' | 'compact';
}

export const TurnstileComponent: FC<TurnstileComponentProps> = ({
	onSuccess,
	onError,
	onExpire,
	theme = 'light',
	size = 'normal',
}) => {
	const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

	// Development fallback - auto-succeed if no key is configured
	if (!siteKey) {
		// Auto-trigger success in development
		setTimeout(() => {
			onSuccess('dev-token-' + Date.now());
		}, 100);

		return (
			<div
				style={{
					background: '#fee2e2',
					border: '1px solid #fecaca',
					borderRadius: '8px',
					padding: '16px',
					textAlign: 'center' as const,
					color: '#dc2626',
					fontSize: '14px',
				}}>
				<p style={{ margin: 0 }}>
					<strong>Development Mode:</strong> Turnstile site key not configured.
					<br />
					CAPTCHA verification bypassed for development.
				</p>
			</div>
		);
	}

	return (
		<Turnstile
			siteKey={siteKey}
			onSuccess={onSuccess}
			onError={onError}
			onExpire={onExpire}
			options={{
				theme,
				size,
			}}
		/>
	);
};
