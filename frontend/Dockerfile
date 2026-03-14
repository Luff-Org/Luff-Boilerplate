FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/auth/package.json ./backend/auth/
COPY backend/posts/package.json ./backend/posts/
COPY backend/api-gateway/package.json ./backend/api-gateway/
COPY shared/config/package.json ./shared/config/
COPY shared/logger/package.json ./shared/logger/
COPY shared/types/package.json ./shared/types/
RUN npm pkg delete scripts.prepare
RUN npm ci --workspace=@app/frontend

FROM base AS builder
WORKDIR /app
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY frontend/ ./frontend/
COPY tsconfig.base.json ./
RUN npm run build --workspace=@app/frontend

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
