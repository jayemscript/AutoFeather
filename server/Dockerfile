FROM node:20-alpine AS base

# Build stage
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.docker ./.env

EXPOSE 3005

CMD ["npm", "run", "prod"]