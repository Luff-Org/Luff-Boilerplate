'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />
          <div className="px-10 pb-10">
            <div className="relative flex justify-between items-end -mt-12 mb-8">
              <div className="p-1 bg-white rounded-full shadow-lg">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="w-24 h-24 rounded-full" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-3xl font-bold">
                    {user?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <button className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors mb-2">
                Edit Profile
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-500">{user?.email}</p>
              </div>

              <hr className="border-gray-100" />

              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">User ID</span>
                  <span className="text-sm font-mono text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    {user?.id}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Login Provider</span>
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Google OAuth
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
