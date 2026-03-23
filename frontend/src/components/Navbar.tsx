'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className={`border-b px-8 py-5 transition-all duration-500 sticky top-0 z-50 ${isDark ? 'bg-[#0F1115]/80 backdrop-blur-3xl border-gray-800/50 shadow-2xl shadow-black/20' : 'bg-white/80 backdrop-blur-3xl border-gray-200 shadow-sm'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className={`font-black text-2xl tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
            LUFF<span className="text-indigo-600">.</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/posts" className={`text-sm font-black transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'}`}>
              Posts
            </Link>
            <Link href="/store" className={`text-sm font-black transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'}`}>
              Store
            </Link>
            {isAuthenticated && (
              <div className="flex items-center gap-6">
                <Link href="/dashboard" className={`text-sm font-black transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'}`}>
                  Documentation
                </Link>
                <Link href="/purchases" className={`text-sm font-black transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'}`}>
                  Purchases
                </Link>
                <Link href="/chat" className="text-sm font-black text-indigo-600 hover:text-indigo-500 bg-indigo-500/10 px-4 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95">
                  ✨ AI Chat
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button 
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all duration-300 hover:scale-110 active:scale-95 ${isDark ? 'bg-gray-800 border-gray-700 text-yellow-400' : 'bg-stone-50 border-stone-200 text-indigo-600'}`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isLoading ? (
            <div className="h-9 w-20 bg-stone-100 animate-pulse rounded-xl" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-5">
              <Link href="/profile" className="flex items-center gap-2.5 group">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-9 h-9 rounded-full border border-stone-200 shadow-sm transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                    {user.name?.charAt(0)}
                  </div>
                )}
                <span className={`text-sm font-black group-hover:text-indigo-600 transition-colors ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  {user.name}
                </span>
              </Link>
              <button
                onClick={logout}
                className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 bg-red-500/10 px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-black text-white bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-xl transition-all shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
