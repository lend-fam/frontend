# Cloudflare Turnstile Setup Guide

This guide explains how to set up Cloudflare Turnstile CAPTCHA for the testnet faucet.

## What is Cloudflare Turnstile?

Cloudflare Turnstile is a privacy-focused CAPTCHA alternative that provides bot protection without requiring users to solve puzzles. It's used on the testnet faucet to prevent abuse.

## Setup Instructions

### 1. Create a Cloudflare Account

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sign up for a free account if you don't have one
3. Navigate to the Turnstile section

### 2. Create a New Site

1. In the Cloudflare Dashboard, go to "Turnstile"
2. Click "Add Site"
3. Configure the site:
   - **Site name**: `lend.fam Testnet Faucet`
   - **Domain**: Add your domain (e.g., `localhost`, `your-domain.com`)
   - **Widget mode**: Choose "Managed" (recommended)
   - **Pre-clearance**: Leave unchecked for basic protection

### 3. Get Your Site Key

1. After creating the site, you'll see:
   - **Site Key**: This is your public key (safe to include in frontend code)
   - **Secret Key**: This is your private key (only for backend verification)

### 4. Configure Environment Variables

1. Copy your **Site Key** from the Cloudflare dashboard
2. Add it to your `.env` file:

```bash
VITE_TURNSTILE_SITE_KEY=your_actual_site_key_here
```

### 5. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/faucet` on testnet
3. You should see the Turnstile widget appear
4. Complete the verification to enable faucet buttons

## Development Mode

If no `VITE_TURNSTILE_SITE_KEY` is configured, the component will:
- Display a development warning
- Automatically bypass CAPTCHA verification
- Allow faucet functionality for testing

## Production Considerations

### Security Best Practices

1. **Domain Restriction**: Configure your Turnstile site to only work on your production domain
2. **Backend Verification**: For production, implement backend verification of Turnstile tokens
3. **Rate Limiting**: Implement additional rate limiting beyond CAPTCHA
4. **Monitoring**: Monitor for suspicious activity and adjust settings as needed

### Backend Verification (Optional)

For enhanced security, you can verify Turnstile tokens on the backend:

```javascript
// Example backend verification
async function verifyTurnstileToken(token) {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: token,
        }),
    });
    
    const data = await response.json();
    return data.success;
}
```

## Troubleshooting

### Common Issues

1. **Widget not appearing**: Check that `VITE_TURNSTILE_SITE_KEY` is set correctly
2. **Domain errors**: Ensure your domain is added to the Turnstile site configuration
3. **Network errors**: Check firewall/proxy settings that might block Cloudflare requests

### Development Tips

1. Use `localhost` in your Turnstile site domains for local development
2. Test on both HTTP and HTTPS if you'll use both
3. Monitor the browser console for Turnstile-related errors

## Configuration Options

The `TurnstileComponent` supports these props:

- `theme`: `'light'` | `'dark'` | `'auto'` (default: `'light'`)
- `size`: `'normal'` | `'compact'` (default: `'normal'`)
- `onSuccess`: Callback when verification succeeds
- `onError`: Callback when verification fails
- `onExpire`: Callback when token expires

## Links

- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Turnstile Dashboard](https://dash.cloudflare.com/turnstile)
- [React Turnstile Package](https://github.com/marsidev/react-turnstile)