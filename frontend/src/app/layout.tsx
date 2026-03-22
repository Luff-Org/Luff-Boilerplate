import type { Metadata } from 'next';
import Link from 'next/link';
import { GoogleOAuthProvider } from '@react-oauth/google';

import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';

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
          <Providers>
            <Navbar />
            <main>{children}</main>
          </Providers>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
