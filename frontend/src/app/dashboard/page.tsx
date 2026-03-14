'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto py-12 px-6">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome back, {user?.name || 'User'}. Here is your account overview.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Posts</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">12</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Storage Used</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">45%</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Account Status</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">Active</p>
          </div>
        </div>

        <div className="mt-10 bg-indigo-600 rounded-3xl p-10 text-white overflow-hidden relative">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Start building your next big thing.</h2>
            <p className="text-indigo-100 text-lg opacity-90 leading-relaxed">
              This boilerplate includes everything you need to build scalable microservices. Explore the codebase and
              start adding your logic.
            </p>
            <button className="mt-8 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-colors">
              Read Documentation
            </button>
          </div>
          <div className="absolute right-[-50px] bottom-[-50px] w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20" />
        </div>
      </div>
    </ProtectedRoute>
  );
}
