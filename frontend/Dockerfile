# ==============================================================================
# Stage 1: Build the React / Vite SPA
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies required for Vite build
RUN npm ci

# Copy frontend source code
COPY . .

# Build production distribution into /dist
RUN npm run build

# ==============================================================================
# Stage 2: Serve production bundle with Nginx
# ==============================================================================
FROM nginx:alpine AS runner

# Remove default Nginx website files and configs
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled frontend assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Healthcheck to verify Nginx webserver
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

