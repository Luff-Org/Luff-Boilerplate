'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, createPost, deletePost } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function PostsPage() {
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = useQuery({ queryKey: ['posts'], queryFn: getPosts });

  const create = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post created successfully!');
    },
    onError: () => {
      toast.error('Failed to create post');
    },
  });

  const remove = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete post');
    },
  });

  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    await create.mutateAsync({ title, content });
    setTitle('');
    setContent('');
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Community Feed</h1>
        <div className="p-1 px-3 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-full border border-indigo-100">
          {posts?.length || 0} Posts
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Create something new</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2"
            >
              Post Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts with the world..."
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={create.isPending}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {create.isPending ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {posts?.map(
            (post: {
              id: string;
              title: string;
              content: string;
              createdAt: string;
              authorId: string;
              authorName?: string;
              authorPicture?: string;
            }) => (
              <div
                key={post.id}
                className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-0.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full">
                    {post.authorPicture ? (
                      <img
                        src={post.authorPicture}
                        alt={post.authorName}
                        className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                        {post.authorName?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 leading-tight">
                      {post.authorName || 'Member'}
                    </h4>
                    <p className="text-sm text-gray-400 font-medium">
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  {user?.id === post.authorId && (
                    <button
                      onClick={() => remove.mutate(post.id)}
                      disabled={remove.isPending}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </button>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-none prose prose-indigo">
                  {post.content}
                </p>
              </div>
            ),
          )}
          {posts?.length === 0 && (
            <div className="text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 py-16">
              <p className="text-xl font-medium text-gray-400">
                Your community is waiting for its first post!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
