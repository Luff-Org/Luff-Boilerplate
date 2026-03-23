import { Router } from 'express';
import multer from 'multer';
import * as aiController from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/chat', authMiddleware, aiController.handleChat);
router.post('/upload', authMiddleware, upload.single('file'), aiController.handleUpload);

export default router;
