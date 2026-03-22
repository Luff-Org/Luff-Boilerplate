import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createLogger } from '@shared/logger';

import { env } from './config/env';
import { errorHandler } from './middlewares/error';
import paymentRoutes from './routes/payment.routes';

const log = createLogger('payment-service');
const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'payment' });
});

// Routes — gateway proxies /payments/* here with full path preserved
app.use('/payments', paymentRoutes);

app.use(errorHandler);

async function start() {
  app.listen(env.PORT || 4003, () => {
    log.info(`payment service running on port ${env.PORT || 4003}`);
  });
}

start().catch((err) => {
  log.error({ err }, 'Failed to start payment service');
  process.exit(1);
});
