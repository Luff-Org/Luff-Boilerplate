import { Router } from 'express';

import { loginUser, myProfile, logout } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/auth/login', loginUser);
router.get('/auth/me', authMiddleware, myProfile);
router.post('/auth/logout', authMiddleware, logout);

export default router;
