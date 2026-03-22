'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';
import { loginWithGoogle, getMe, logoutUser } from '@/lib/api';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: user, isLoading } = useQuery({ queryKey: ['me'], queryFn: getMe, retry: false });
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      try {
        setLoading(true);
        await loginWithGoogle(codeResponse.code);
        await queryClient.invalidateQueries({ queryKey: ['me'] });
        toast.success('Login successful!');
        router.push('/dashboard');
        router.refresh();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Login failed. Please try again.');
        setLoading(false);
      }
    },
    onError: () => {
      toast.error('Google popup closed or failed.');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Sign In</h1>
        <p className="text-gray-500 text-center mt-2 mb-6">Continue with your Google account</p>

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
