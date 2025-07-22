# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build arguments to determine build mode (prod or develop)
ARG BUILD_MODE=prod
ARG VITE_APP_ENVIRONMENT=production

# Set environment variable for Vite build
ENV VITE_APP_ENVIRONMENT=${VITE_APP_ENVIRONMENT}

# Build the application with the specified mode
RUN if [ "$BUILD_MODE" = "develop" ]; then bun run build:develop; else bun run build; fi

# Production stage using nginx for static file serving
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (reproxy will handle SSL)
EXPOSE 80