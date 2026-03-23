'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-gray-900">
            Boilerplate
          </Link>
          <Link href="/posts" className="text-sm text-gray-600 hover:text-gray-900">
            Posts
          </Link>
          <Link href="/store" className="text-sm text-gray-600 hover:text-gray-900">
            Store
          </Link>
          {isAuthenticated && (
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/purchases" className="text-sm text-gray-600 hover:text-gray-900">
                Purchases
              </Link>
              <Link href="/chat" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full transition-all">
                ✨ AI Chat
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-100 animate-pulse rounded" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-2 group">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                    {user.name?.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {user.name}
                </span>
              </Link>
              <button
                onClick={logout}
                className="text-xs font-semibold text-red-600 hover:text-red-500 bg-red-50 px-3 py-1.5 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
