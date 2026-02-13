FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY .env.docker .env.production.local
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env.docker ./.env.production.local
COPY --from=builder /app/next.config.* ./

EXPOSE 3000

CMD ["npm", "run", "start"]