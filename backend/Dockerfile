# ==============================================
# Multi-stage Dockerfile for Backend (NestJS + Prisma)
# ==============================================

# Stage 1: Install dependencies and generate Prisma Client
FROM node:20-alpine AS deps

WORKDIR /app

# Install native dependencies required by Prisma engine on Alpine
RUN apk add --no-cache openssl libc6-compat

# Copy dependency manifests and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma Client for the current Linux Alpine architecture
RUN npx prisma generate

# Stage 2: Build the NestJS application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Compile TypeScript to JavaScript in dist/
RUN npm run build

# Remove development dependencies to keep the image minimal
RUN npm prune --omit=dev

# Stage 3: Production runtime image
FROM node:20-alpine AS runner

WORKDIR /app

# Install openssl for Prisma runtime and dumb-init for proper PID 1 signal forwarding
RUN apk add --no-cache openssl dumb-init

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root system user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestuser -u 1001 -G nodejs

# Copy runtime node_modules, compiled dist, Prisma assets, and entrypoint
COPY --from=builder --chown=nestuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestuser:nodejs /app/dist ./dist
COPY --from=builder --chown=nestuser:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestuser:nodejs /app/package*.json ./
COPY --chown=nestuser:nodejs docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

# Run as non-privileged user
USER nestuser

EXPOSE 3000

# Health check against the versioned health endpoint
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

ENTRYPOINT ["dumb-init", "--", "./docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
