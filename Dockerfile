# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Build arguments to determine build mode (prod or develop)
ARG BUILD_MODE=prod

# Copy package files first for better layer caching
COPY package.json bun.lock ./

# Copy environment files for build configuration
COPY .env.develop .env.production ./

# Install dependencies with cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Copy source code (this layer will change most frequently)
COPY . .

# Copy appropriate environment file based on build mode
RUN if [ "$BUILD_MODE" = "develop" ]; then \
      cp .env.develop .env.local; \
    else \
      cp .env.production .env.local; \
    fi

# Build the application with the specified mode
RUN if [ "$BUILD_MODE" = "develop" ]; then bun run build:develop; else bun run build; fi

# Production stage using nginx for static file serving
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]