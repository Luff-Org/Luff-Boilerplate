'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, createPost, deletePost } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'sonner';

export default function PostsPage() {
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
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
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0F1115] text-gray-200' : 'bg-[#FDFBF7] text-stone-900'}`}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Community Feed</h1>
          <div className={`px-3 py-1 text-[10px] font-black rounded-full border transition-colors uppercase tracking-widest ${isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
            {posts?.length || 0} Posts
          </div>
        </div>

        <div className={`rounded-3xl shadow-sm border p-8 mb-12 transition-all duration-500 ${isDark ? 'bg-[#17191E] border-gray-800' : 'bg-white border-stone-100'}`}>
          <h2 className={`text-xl font-black mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Create something new</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              >
                Post Title
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                required
                className={`w-full px-5 py-3 rounded-xl text-sm font-bold transition-all border ${isDark ? 'bg-[#0F1115] border-gray-800 text-white placeholder-gray-600 focus:ring-indigo-500/20' : 'bg-gray-50 border-stone-100 text-gray-900 placeholder-gray-400 focus:ring-indigo-500/10 focus:bg-white'}`}
              />
            </div>
            <div>
              <label
                htmlFor="content"
                className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              >
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts with the world..."
                required
                rows={3}
                className={`w-full px-5 py-3 rounded-xl text-sm font-bold transition-all border ${isDark ? 'bg-[#0F1115] border-gray-800 text-white placeholder-gray-600 focus:ring-indigo-500/20' : 'bg-gray-50 border-stone-100 text-gray-900 placeholder-gray-400 focus:ring-indigo-500/10 focus:bg-white'}`}
              />
            </div>
            <button
              type="submit"
              disabled={create.isPending}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {create.isPending ? 'Publishing...' : 'Publish Post'}
            </button>
          </form>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            {posts?.map((post: any) => (
              <div
                key={post.id}
                className={`group rounded-3xl border p-8 transition-all duration-500 ${isDark ? 'bg-[#17191E] border-gray-800 hover:border-indigo-500/20 shadow-sm' : 'bg-white border-stone-100 shadow-sm'}`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-0.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full shadow-sm">
                    {post.authorPicture ? (
                      <img
                        src={post.authorPicture}
                        alt={post.authorName}
                        className={`w-10 h-10 rounded-full border-2 ${isDark ? 'border-[#17191E]' : 'border-white'}`}
                    />
                    ) : (
                      <div className={`w-10 h-10 rounded-full border-2 bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-black ${isDark ? 'border-[#17191E]' : 'border-white'}`}>
                        {post.authorName?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-black leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {post.authorName || 'Member'}
                    </h4>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
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
                      className={`p-2 rounded-lg transition-all ${isDark ? 'text-gray-600 hover:text-red-500 hover:bg-red-500/10' : 'text-stone-300 hover:text-red-600 hover:bg-red-50'}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>

                <h3 className={`text-lg font-black mb-2 transition-colors ${isDark ? 'text-white group-hover:text-indigo-400' : 'text-gray-900 group-hover:text-indigo-600'}`}>
                  {post.title}
                </h3>
                <p className={`text-sm leading-relaxed prose prose-sm ${isDark ? 'text-gray-500' : 'text-stone-600'}`}>
                  {post.content}
                </p>
              </div>
            ))}
            {posts?.length === 0 && (
              <div className={`text-center rounded-3xl border-2 border-dashed py-16 px-6 transition-colors ${isDark ? 'bg-black/20 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-lg font-black ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>
                  Your community is waiting for its first post!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
