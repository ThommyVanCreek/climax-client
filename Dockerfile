# ═══════════════════════════════════════════════════════════════════════════════
# ClimaX Client - Docker Image (Multi-stage build)
# ═══════════════════════════════════════════════════════════════════════════════
# Build: docker build -t climax-client .
# Run:   docker run -p 80:80 climax-client
# ═══════════════════════════════════════════════════════════════════════════════

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source
COPY . .

# Build arguments for environment variables (injected at build time)
ARG VITE_BRIDGE_URL
ARG VITE_API_URL
ARG VITE_API_KEY

ENV VITE_BRIDGE_URL=$VITE_BRIDGE_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_KEY=$VITE_API_KEY

# Build the app
RUN npm run build

# Stage 2: Production with nginx
FROM nginx:1.25-alpine

# Add labels for container registry
LABEL org.opencontainers.image.title="ClimaX Client"
LABEL org.opencontainers.image.description="Vue.js web client for ClimaX Security System"
LABEL org.opencontainers.image.vendor="ClimaX"

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user for nginx
RUN adduser -D -H -u 1000 -s /sbin/nologin www-data-user && \
    chown -R www-data-user:www-data-user /var/cache/nginx && \
    chown -R www-data-user:www-data-user /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R www-data-user:www-data-user /var/run/nginx.pid

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
