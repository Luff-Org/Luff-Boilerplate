FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/payment/package.json ./backend/payment/
COPY shared/types/package.json ./shared/types/
COPY shared/logger/package.json ./shared/logger/
COPY shared/config/package.json ./shared/config/
RUN npm install --workspace=@backend/payment

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/payment/node_modules ./backend/payment/node_modules
COPY shared/ ./shared/
COPY backend/payment/ ./backend/payment/
COPY tsconfig.base.json ./
RUN npm run build --workspace=@shared/types
RUN npm run build --workspace=@shared/logger
RUN npm run build --workspace=@shared/config
RUN npm run build --workspace=@backend/payment

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=builder /app/backend/payment/dist ./dist
COPY --from=builder /app/backend/payment/node_modules ./node_modules
COPY --from=builder /app/backend/payment/package.json ./
USER appuser
EXPOSE 4003
CMD ["node", "dist/index.js"]
