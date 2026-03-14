import type { Metadata } from 'next';
import Link from 'next/link';
import { GoogleOAuthProvider } from '@react-oauth/google';

import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Microservices Boilerplate',
  description: 'Production-grade microservices starter',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        <GoogleOAuthProvider clientId={clientId}>
          <nav className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="max-w-5xl mx-auto flex items-center gap-6">
              <Link href="/" className="font-bold text-gray-900">
                Boilerplate
              </Link>
              <Link href="/posts" className="text-sm text-gray-600 hover:text-gray-900">
                Posts
              </Link>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 ml-auto">
                Login
              </Link>
            </div>
          </nav>
          <Providers>{children}</Providers>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
