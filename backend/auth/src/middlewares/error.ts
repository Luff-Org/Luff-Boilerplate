import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@shared/logger';

const log = createLogger('auth-error-handler');

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  log.error({ err }, 'Unhandled error');
  res.status(500).json({ success: false, error: 'Internal server error' });
}
