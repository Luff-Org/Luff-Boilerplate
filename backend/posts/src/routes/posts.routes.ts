import { Router } from 'express';

import { getPosts, getPostById, createPost, deletePost } from '../controllers/posts.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);
router.post('/posts', authMiddleware, createPost);
router.delete('/posts/:id', authMiddleware, deletePost);

export default router;
