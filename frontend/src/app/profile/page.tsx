'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  const update = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  async function handleSave() {
    if (!newName.trim()) return;
    await update.mutateAsync({ name: newName });
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x" />
          <div className="px-10 pb-10">
            <div className="relative flex justify-between items-end -mt-12 mb-10">
              <div className="p-1.5 bg-white rounded-full shadow-2xl">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-24 h-24 rounded-full border-2 border-gray-50"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-3xl font-bold border-2 border-gray-50">
                    {user?.name?.charAt(0)}
                  </div>
                )}
              </div>

              {!isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setNewName(user?.name || '');
                  }}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all transform active:scale-95 shadow-lg shadow-gray-200 mb-2"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-white text-gray-600 px-6 py-2.5 rounded-2xl text-sm font-bold border border-gray-200 hover:bg-gray-50 transition-all transform active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={update.isPending}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all transform active:scale-95 shadow-lg shadow-indigo-100 disabled:opacity-50"
                  >
                    {update.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Display Name
                    </label>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                      {user?.name}
                    </h1>
                    <p className="text-lg text-gray-500 font-medium">{user?.email}</p>
                  </>
                )}
              </div>

              <div className="pt-2">
                <div className="h-px bg-gray-100 w-full mb-8" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-50">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                      User ID
                    </span>
                    <span className="text-sm font-mono text-gray-600 break-all">{user?.id}</span>
                  </div>
                  <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-50">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                      Login Provider
                    </span>
                    <span className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse" />
                      Google OAuth 2.0
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
