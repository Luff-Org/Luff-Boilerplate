FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/posts/package.json ./backend/posts/
COPY shared/types/package.json ./shared/types/
COPY shared/logger/package.json ./shared/logger/
COPY shared/config/package.json ./shared/config/
RUN npm pkg delete scripts.prepare
RUN npm install --workspace=@backend/posts

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY shared/ ./shared/
COPY backend/posts/ ./backend/posts/
COPY tsconfig.base.json ./
RUN npm run build --workspace=@shared/types
RUN npm run build --workspace=@shared/logger
RUN npm run build --workspace=@shared/config
RUN npm run build --workspace=@backend/posts
RUN cd backend/posts && npx prisma generate
# Override shared package entry points for production
RUN for pkg in shared/*/package.json; do sed -i 's|./src/index.ts|./dist/index.js|g' "$pkg"; done

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=builder /app/shared ./shared
RUN rm -rf ./shared/*/src
COPY --from=builder /app/backend/posts/dist ./dist
COPY --from=builder /app/backend/posts/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/posts/package.json ./
USER appuser
EXPOSE 4002
CMD ["node", "dist/index.js"]
