import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Microservices Boilerplate</h1>
        <p className="text-lg text-gray-500 mb-8">
          Production-grade starter with Next.js, Express, Prisma, and Google OAuth.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/posts"
            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            View Posts
          </Link>
        </div>
      </div>
    </div>
  );
}
