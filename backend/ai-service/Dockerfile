FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/ai-service/package.json ./backend/ai-service/
COPY shared/types/package.json ./shared/types/
COPY shared/logger/package.json ./shared/logger/
COPY shared/config/package.json ./shared/config/
RUN npm pkg delete scripts.prepare
RUN npm install --workspace=@backend/ai-service

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY shared/ ./shared/
COPY backend/ai-service/ ./backend/ai-service/
COPY tsconfig.base.json ./
RUN npm run build --workspace=@shared/types
RUN npm run build --workspace=@shared/logger
RUN npm run build --workspace=@shared/config
RUN npm run build --workspace=@backend/ai-service
# Override shared package entry points for production
RUN for pkg in shared/*/package.json; do sed -i 's|./src/index.ts|./dist/index.js|g' "$pkg"; done

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=builder /app/shared ./shared
RUN rm -rf ./shared/*/src
COPY --from=builder /app/backend/ai-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/ai-service/package.json ./
USER appuser
EXPOSE 4004
CMD ["node", "dist/index.js"]
