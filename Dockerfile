# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage using reproxy
FROM umputun/reproxy

# Copy built assets from builder stage
COPY --from=builder /app/dist /srv/site

# Configure reproxy for SPA mode with static file serving
ENTRYPOINT ["/srv/reproxy", "--assets.location=/srv/site", "--assets.spa"]