import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createLogger } from '@shared/logger';

import { env } from './config/env';
import { connectDatabase } from './db';
import postsRoutes from './routes/posts.routes';
import { errorHandler } from './middlewares/error';

const log = createLogger('posts-service');
const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'posts' });
});

app.use(postsRoutes);
app.use(errorHandler);

async function start() {
  await connectDatabase();
  app.listen(env.PORT, () => {
    log.info(`Posts service running on port ${env.PORT}`);
  });
}

start().catch((err) => {
  log.error({ err }, 'Failed to start posts service');
  process.exit(1);
});
