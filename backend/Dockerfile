# ==============================================================================
# Online Store Backend - Production Dockerfile
# ==============================================================================
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install curl for container healthcheck
RUN apk add --no-cache curl

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose backend port
EXPOSE 5000

# Healthcheck to verify backend status
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the Node.js Express server
CMD ["node", "src/server.js"]

