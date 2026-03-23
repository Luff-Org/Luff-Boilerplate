'use client';

import { useTheme } from '@/context/ThemeContext';
import { Navbar } from '@/components/Navbar';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0F1115] text-gray-200' : 'bg-[#FDFBF7] text-stone-900'}`}>
      <Navbar />
      <main className="transition-all duration-500">{children}</main>
    </div>
  );
}
