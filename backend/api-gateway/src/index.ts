import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createLogger } from '@shared/logger';

import { env } from './config/env';
import { requestLogger } from './middlewares/logger';
import { rateLimiter } from './middlewares/rate-limit';

const log = createLogger('api-gateway');
const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(rateLimiter);
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Proxy /auth/* → auth service
app.use(
  '/auth',
  createProxyMiddleware({
    target: env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (_path, req) => req.originalUrl,
    on: {
      error: (err) => log.error({ err }, 'Auth proxy error'),
    },
  }),
);

// Proxy /posts/* → posts service
app.use(
  '/posts',
  createProxyMiddleware({
    target: env.POSTS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (_path, req) => req.originalUrl,
    on: {
      error: (err) => log.error({ err }, 'Posts proxy error'),
    },
  }),
);

app.listen(env.PORT, () => {
  log.info(`API Gateway running on port ${env.PORT}`);
});
