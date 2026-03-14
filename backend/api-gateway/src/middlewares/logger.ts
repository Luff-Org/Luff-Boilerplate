import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@shared/logger';

const log = createLogger('gateway-request');

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  log.info({ method: req.method, url: req.url, ip: req.ip }, 'Incoming request');
  next();
}
