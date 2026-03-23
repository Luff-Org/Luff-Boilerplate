import { Response } from 'express';
import { createLogger } from '@shared/logger';

import { AuthRequest } from '../middlewares/auth';
import * as postsService from '../services/posts.service';

const log = createLogger('posts-controller');

export async function getPosts(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const posts = await postsService.getAllPosts();
    res.json({ success: true, data: posts });
  } catch (error) {
    log.error({ error }, 'Failed to get posts');
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function getPostById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const post = await postsService.getPostById(req.params.id);

    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    res.json({ success: true, data: post });
  } catch (error) {
    log.error({ error }, 'Failed to get post');
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function createPost(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400).json({ success: false, error: 'Title and content are required' });
      return;
    }

    const post = await postsService.createPost({
      title,
      content,
      authorId: req.userId,
      authorName: req.userName || 'Anonymous',
      authorPicture: req.userPicture,
    });
    log.info({ postId: post.id }, 'Post created');
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    log.error({ error }, 'Failed to create post');
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function deletePost(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    await postsService.deletePost(req.params.id, req.userId);
    res.json({ success: true, data: { message: 'Post deleted' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Post not found' ? 404 : message === 'Unauthorized' ? 403 : 500;
    res.status(status).json({ success: false, error: message });
  }
}
