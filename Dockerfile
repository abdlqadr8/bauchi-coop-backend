# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy Prisma client
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy prisma schema and migrations
COPY prisma ./prisma

EXPOSE 3000

# Run migrations and start app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
