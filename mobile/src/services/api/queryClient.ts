import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes fresh cache
      gcTime: 1000 * 60 * 15,   // 15 minutes garbage collection
      retry: (failureCount, error: unknown) => {
        // Do not retry on 401 Unauthorized or 404 Not Found
        const status = (error as { statusCode?: number })?.statusCode;
        if (status === 401 || status === 404) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
