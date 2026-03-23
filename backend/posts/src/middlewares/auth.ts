import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';

export interface AuthRequest extends Request {
  userId?: string;
  userName?: string;
  userPicture?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && /^Bearer /i.test(authHeader) ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized: Missing or malformed token' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      name: string;
      picture?: string;
    };
    req.userId = decoded.userId;
    req.userName = decoded.name;
    req.userPicture = decoded.picture;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}
