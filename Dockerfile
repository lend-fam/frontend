# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage using reproxy
FROM umputun/reproxy

# Copy built assets from builder stage
COPY --from=builder /app/dist /srv/site

# Configure reproxy for SPA mode with static file serving and HTTPS
ENTRYPOINT ["/srv/reproxy", "--assets.location=/srv/site", "--assets.spa", "--ssl.type=auto", "--ssl.acme-email=admin@lend.family", "--ssl.fqdn=lend.family", "--ssl.acme-location=/srv/var/ssl"]