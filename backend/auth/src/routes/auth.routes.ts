import { Router } from 'express';

import { loginUser, myProfile, logout, updateProfile } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/auth/login', loginUser);
router.get('/auth/me', authMiddleware, myProfile);
router.patch('/auth/me', authMiddleware, updateProfile);
router.post('/auth/logout', authMiddleware, logout);

export default router;
