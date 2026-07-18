import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (count, err: any) => (err?.statusCode >= 400 && err?.statusCode < 500 ? false : count < 2),
      refetchOnWindowFocus: false,
    },
  },
});
