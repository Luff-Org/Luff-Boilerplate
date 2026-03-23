'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

export default function HomePage() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-500 py-32 px-6 ${isDark ? 'bg-[#0F1115] text-gray-200' : 'bg-[#FDFBF7] text-stone-900'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className={`text-5xl font-black tracking-tight mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Microservices Boilerplate<span className="text-indigo-600">.</span>
          </h1>
          <p className={`text-base font-bold mb-12 opacity-70 ${isDark ? 'text-gray-400' : 'text-stone-600'}`}>
            Production-grade starter with Next.js, Express, Prisma, and Google OAuth.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-black text-sm rounded-xl hover:bg-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all transform hover:scale-105 active:scale-95"
            >
              Sign In
            </Link>
            <Link
              href="/posts"
              className={`inline-flex items-center px-8 py-3 font-black text-sm rounded-xl border transition-all transform hover:scale-105 active:scale-95 ${isDark ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-stone-100 text-gray-900 hover:bg-stone-50'}`}
            >
              View Feed
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
