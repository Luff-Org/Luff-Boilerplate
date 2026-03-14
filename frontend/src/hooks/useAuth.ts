'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, logoutUser } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logout = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
      queryClient.clear();
      router.push('/login');
      router.refresh();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: () => logout.mutate(),
    isLoggingOut: logout.isPending,
  };
}
