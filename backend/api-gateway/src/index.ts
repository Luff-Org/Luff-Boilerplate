import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createLogger } from '@shared/logger';

import { env } from './config/env';
import { requestLogger } from './middlewares/logger';
import { rateLimiter } from './middlewares/rate-limit';
import { authProxy, postsProxy, paymentProxy } from './routes/proxy';

const log = createLogger('api-gateway');
const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

app.use(rateLimiter);
app.use(requestLogger);

// Proxy /auth/* → auth service
app.use('/auth', authProxy);

// Proxy /posts/* → posts service
app.use('/posts', postsProxy);

// Proxy /payments/* → payment service
app.use('/payments', paymentProxy);

app.listen(env.PORT, () => {
  log.info(`API Gateway running on port ${env.PORT}`);
});
