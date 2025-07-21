# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Copy production environment file explicitly
COPY .env.production .env.production

# Build the application with production mode
RUN NODE_ENV=production bun run build

# Production stage using reproxy
FROM umputun/reproxy

# Copy built assets from builder stage
COPY --from=builder /app/dist /srv/site

# Configure reproxy for SPA mode with static file serving and HTTPS
ENTRYPOINT ["/srv/reproxy", "--assets.location=/srv/site", "--assets.spa", "--ssl.type=auto", "--ssl.acme-email=admin@lend.family", "--ssl.fqdn=lend.family", "--ssl.acme-location=/srv/var/ssl"]