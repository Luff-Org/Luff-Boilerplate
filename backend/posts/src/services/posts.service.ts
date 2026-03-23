import { prisma } from '../db';

export async function getAllPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPostById(id: string) {
  return prisma.post.findUnique({ where: { id } });
}

export async function createPost(data: {
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPicture?: string;
}) {
  return prisma.post.create({ data });
}

export async function deletePost(id: string, authorId: string) {
  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    throw new Error('Post not found');
  }

  if (post.authorId !== authorId) {
    throw new Error('Unauthorized');
  }

  return prisma.post.delete({ where: { id } });
}
