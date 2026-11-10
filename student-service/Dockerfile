FROM node:20-alpine

WORKDIR /app

# Copy package descriptors first for layer caching
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose microservice port
EXPOSE 5002

# Healthcheck for container status
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5002/api/students/health || exit 1

# Start service
CMD ["node", "src/index.js"]
