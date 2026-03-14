FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/api-gateway/package.json ./backend/api-gateway/
COPY shared/logger/package.json ./shared/logger/
COPY shared/config/package.json ./shared/config/
COPY shared/types/package.json ./shared/types/
RUN npm pkg delete scripts.prepare
RUN npm install --workspace=@backend/api-gateway

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY shared/ ./shared/
COPY backend/api-gateway/ ./backend/api-gateway/
COPY tsconfig.base.json ./
RUN npm run build --workspace=@shared/types
RUN npm run build --workspace=@shared/logger
RUN npm run build --workspace=@shared/config
RUN npm run build --workspace=@backend/api-gateway
# Override shared package entry points for production
RUN for pkg in shared/*/package.json; do sed -i 's|./src/index.ts|./dist/index.js|g' "$pkg"; done

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=builder /app/shared ./shared
RUN rm -rf ./shared/*/src
COPY --from=builder /app/backend/api-gateway/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/api-gateway/package.json ./
USER appuser
EXPOSE 4000
CMD ["node", "dist/index.js"]
