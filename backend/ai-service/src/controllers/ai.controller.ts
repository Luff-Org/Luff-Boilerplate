import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as aiService from '../services/ai.service';
import { createLogger } from '@shared/logger';

const log = createLogger('ai-controller');

export async function handleChat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { message, mode } = req.body;

    if (!message) {
      res.status(400).json({ success: false, error: 'Message is required' });
      return;
    }

    if (!['generic', 'rag'].includes(mode)) {
      res.status(400).json({ success: false, error: 'Invalid mode' });
      return;
    }

    const reply = await aiService.chat(message, mode, req.userId!);
    res.json({ success: true, data: { reply } });
  } catch (error: any) {
    console.error('❌ Chat Controller Error:', error);
    log.error({ error: error.message || error }, 'Chat controller failed');
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function handleUpload(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    await aiService.processPdf(req.file.buffer, req.userId!);
    res.json({ success: true, message: 'PDF processed and indexed' });
  } catch (error) {
    log.error({ error }, 'Upload controller failed');
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
