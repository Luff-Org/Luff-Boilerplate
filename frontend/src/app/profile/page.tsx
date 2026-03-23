'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
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
      <div className={`min-h-screen transition-all duration-500 py-16 px-6 ${isDark ? 'bg-[#0F1115] text-gray-200' : 'bg-[#FDFBF7] text-stone-900'}`}>
        <div className={`max-w-2xl mx-auto rounded-[2.5rem] border overflow-hidden shadow-sm transition-all duration-500 ${isDark ? 'bg-[#17191E] border-gray-800' : 'bg-white border-gray-100'}`}>
          <div className="h-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient-x" />
          <div className="px-10 pb-12">
            <div className="relative flex justify-between items-end -mt-12 mb-10">
              <div className={`p-1.5 rounded-full shadow-xl transition-colors ${isDark ? 'bg-[#17191E]' : 'bg-white'}`}>
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className={`w-28 h-28 rounded-full border-4 ${isDark ? 'border-gray-800' : 'border-gray-50'}`}
                  />
                ) : (
                  <div className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-black border-4 ${isDark ? 'bg-gray-800 text-indigo-400 border-gray-700' : 'bg-indigo-100 text-indigo-700 border-gray-50'}`}>
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
                  className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 shadow-lg ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3 mb-1">
                  <button
                    onClick={() => setIsEditing(false)}
                    className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all transform hover:scale-105 active:scale-95 ${isDark ? 'bg-transparent border-gray-800 text-gray-400 hover:bg-white/5' : 'bg-white border-stone-100 text-stone-500 hover:bg-stone-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={update.isPending}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/10 disabled:opacity-50"
                  >
                    {update.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-10">
              <div className="space-y-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-stone-400'}`}>
                      Display Name
                    </label>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className={`w-full text-2xl font-black rounded-xl px-5 py-3 transition-all focus:outline-none focus:ring-4 ${isDark ? 'bg-black/30 border-gray-800 text-white focus:ring-indigo-500/20' : 'bg-stone-50 border-stone-100 text-gray-900 focus:ring-indigo-500/5'}`}
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user?.name}
                    </h1>
                    <p className={`text-sm font-bold opacity-60 ${isDark ? 'text-gray-500' : 'text-stone-500'}`}>{user?.email}</p>
                  </>
                )}
              </div>

              <div className="pt-2">
                <div className={`h-px w-full mb-8 transition-colors ${isDark ? 'bg-gray-800' : 'bg-stone-50'}`} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-2xl border transition-colors ${isDark ? 'bg-black/20 border-gray-800' : 'bg-gray-50/50 border-stone-50'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${isDark ? 'text-gray-600' : 'text-stone-400'}`}>
                      Universal ID
                    </span>
                    <span className={`text-xs font-mono font-bold break-all ${isDark ? 'text-gray-500' : 'text-stone-500'}`}>{user?.id}</span>
                  </div>
                  <div className={`p-6 rounded-2xl border transition-colors ${isDark ? 'bg-black/20 border-gray-800' : 'bg-gray-50/50 border-stone-50'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${isDark ? 'text-gray-600' : 'text-stone-400'}`}>
                      Provider
                    </span>
                    <span className="text-[10px] font-black text-indigo-500 flex items-center gap-2 uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg animate-pulse" />
                      Google Auth 2.0
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
