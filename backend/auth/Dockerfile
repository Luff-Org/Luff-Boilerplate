FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/auth/package.json ./backend/auth/
COPY shared/types/package.json ./shared/types/
COPY shared/logger/package.json ./shared/logger/
COPY shared/config/package.json ./shared/config/
RUN npm pkg delete scripts.prepare
RUN npm install --workspace=@backend/auth

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY shared/ ./shared/
COPY backend/auth/ ./backend/auth/
COPY tsconfig.base.json ./
RUN npm run build --workspace=@shared/types
RUN npm run build --workspace=@shared/logger
RUN npm run build --workspace=@shared/config
RUN npx prisma generate --schema=./backend/auth/prisma/schema.prisma
RUN npm run build --workspace=@backend/auth
# Override shared package entry points for production
RUN for pkg in shared/*/package.json; do sed -i 's|./src/index.ts|./dist/index.js|g' "$pkg"; done

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=builder /app/shared ./shared
RUN rm -rf ./shared/*/src
COPY --from=builder /app/backend/auth/dist ./dist
COPY --from=builder /app/backend/auth/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/auth/package.json ./
USER appuser
EXPOSE 4001
CMD ["node", "dist/index.js"]
