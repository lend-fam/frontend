# PostHog Analytics GitHub Setup Guide

This guide explains how to configure PostHog analytics for your GitHub CI/CD deployment pipeline.

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### Navigate to GitHub Secrets
1. Go to your GitHub repository
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Add Required Secrets

#### 1. PostHog API Key
- **Secret Name**: `VITE_POSTHOG_API_KEY`
- **Secret Value**: Your PostHog project API key (starts with `phc_`)
- **How to get it**:
  1. Go to your PostHog project dashboard
  2. Click **Project Settings** (gear icon)
  3. Go to **Project Variables**
  4. Copy the **Project API Key**

#### 2. PostHog API Host (Optional)
- **Secret Name**: `VITE_POSTHOG_API_HOST`
- **Secret Value**: `https://app.posthog.com` (or your custom PostHog instance URL)
- **Default**: If not set, defaults to `https://app.posthog.com`

## How It Works

### Build Process
1. GitHub Actions workflows pass the secrets as build arguments to Docker
2. Docker uses these arguments as environment variables during the Vite build
3. Vite injects the variables into the built application
4. The analytics provider initializes with the configured API key

### Environment-Specific Deployment
- **Development**: Uses secrets for `/development/` deployment
- **Production**: Uses the same secrets for production deployment
- **Local Development**: Uses local `.env` files (secrets not included)

## Deployment Workflow Updates

The following workflows have been updated to include PostHog configuration:

### Development Deployment (`.github/workflows/deploy-develop.yml`)
- Triggered on pushes to `develop` branch
- Builds with PostHog secrets for development environment
- Deploys to `https://lend.family/development/`

### Production Deployment (`.github/workflows/deploy-production.yml`)
- Triggered on pushes to `main` branch
- Builds with PostHog secrets for production environment
- Deploys to `https://lend.family/`

## Security Considerations

- ✅ **Secrets are not exposed**: Build-time injection means secrets are compiled into the application
- ✅ **No sensitive data**: PostHog API keys are designed to be public-facing for client-side use
- ✅ **Environment isolation**: Development and production can use different PostHog projects if needed
- ✅ **Fallback behavior**: Application works normally even if PostHog is not configured

## Verification

After setting up the secrets and deploying:

1. **Check build logs**: GitHub Actions should show successful builds without PostHog errors
2. **Test analytics**: Visit your deployed application and check the browser console for "PostHog analytics initialized"
3. **Verify data**: Check your PostHog dashboard for incoming events

## Troubleshooting

### Build fails with PostHog errors
- Verify the `VITE_POSTHOG_API_KEY` secret is set correctly in GitHub
- Check that the API key starts with `phc_`
- Ensure the PostHog project is active

### No analytics data in PostHog
- Check browser console for PostHog initialization messages
- Verify the API key corresponds to the correct PostHog project
- Check if ad blockers are interfering with PostHog requests

### Different PostHog projects for environments
If you want separate PostHog projects for development and production:
1. Create additional secrets: `VITE_POSTHOG_API_KEY_DEV` and `VITE_POSTHOG_API_KEY_PROD`
2. Update the workflow files to use environment-specific secrets
3. Modify the Dockerfile to handle conditional secret assignment

## Next Steps

1. Add the GitHub secrets as described above
2. Push to `develop` or `main` branch to trigger deployment
3. Monitor the build process and verify analytics are working
4. Set up PostHog dashboards and insights for your web3 analytics data