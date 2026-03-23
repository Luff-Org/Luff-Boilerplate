import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createLogger } from '@shared/logger';
import { env } from './config/env';
import aiRoutes from './routes/ai.routes';

const log = createLogger('ai-service');
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use(aiRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-service' });
});

const port = env.PORT || 4004;

app.listen(port, () => {
  log.info(`AI Service listening on port ${port}`);
});
