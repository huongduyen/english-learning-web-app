# ==============================================
# Multi-stage Dockerfile for Frontend (React/Vite)
# ==============================================

# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies with clean slate
COPY package*.json ./
RUN npm ci

# Inject build-time environment arguments
ARG VITE_API_BASE_URL="/api/v1"
ARG VITE_APP_NAME="English Learning Platform"
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}

# Copy frontend source files
COPY . .

# Build production bundle (tsc -b && vite build)
RUN npm run build

# Stage 2: Production web server (Nginx Alpine)
FROM nginx:1.27-alpine AS runner

# Remove default nginx configurations
RUN rm -rf /etc/nginx/conf.d/* /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled frontend assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
