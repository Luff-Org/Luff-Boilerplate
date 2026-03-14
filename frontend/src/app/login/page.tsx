'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';
import { loginWithGoogle, getMe, logoutUser } from '@/lib/api';

export default function LoginPage() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({ queryKey: ['me'], queryFn: getMe, retry: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      try {
        setLoading(true);
        setError(null);
        await loginWithGoogle(codeResponse.code);
        queryClient.invalidateQueries({ queryKey: ['me'] });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google popup closed or failed.');
    },
  });

  async function handleLogout() {
    await logoutUser();
    queryClient.invalidateQueries({ queryKey: ['me'] });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome back</h1>
          <div className="flex items-center gap-4 mb-6">
            {user.picture && <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full" />}
            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Sign In</h1>
        <p className="text-gray-500 text-center mt-2 mb-6">Continue with your Google account</p>
        
        {error && <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg">{error}</div>}
        
        <button
          onClick={() => googleLogin()}
          disabled={loading}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <FcGoogle className="w-5 h-5 mr-2" />
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
}
