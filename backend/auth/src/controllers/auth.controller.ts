import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';

import { prisma } from '../db';
import { env } from '../config/env';
import { oauth2Client } from '../config/googleConfig';
import { createLogger } from '@shared/logger';
import { AuthRequest } from '../middlewares/auth';

const log = createLogger('auth-controller');

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Code is required' });
    }

    const googleResponse = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleResponse.tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`,
    );

    const { email, name, picture } = userRes.data;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || '',
          picture: picture || null,
          provider: 'google',
        },
      });
    } else {
      // Update name/picture if changed
      user = await prisma.user.update({
        where: { email },
        data: { name: name || user.name, picture: picture || user.picture },
      });
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '15d' });

    // Matching user's output format closely
    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: { token, user },
    });
  } catch (error: any) {
    log.error({ error: error.message || error }, 'Controller Error');
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const myProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({ where: { id: authReq.userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    log.error({ error: error.message || error }, 'Controller Error');
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    log.error({ error: error.message || error }, 'Controller Error');
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};
