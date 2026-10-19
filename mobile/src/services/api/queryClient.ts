import { QueryClient } from '@tanstack/react-query';
import { CACHE_MAX_AGE_MS } from '../storage/queryPersistor';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 minutes fresh data window
      gcTime: CACHE_MAX_AGE_MS,       // 7 days retention matching SQLite cache TTL
      networkMode: 'offlineFirst',    // Return cached data immediately if offline
      retry: (failureCount, error: unknown) => {
        // Do not retry on 401 Unauthorized or 404 Not Found
        const status = (error as { statusCode?: number })?.statusCode;
        if (status === 401 || status === 404) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,       // Silently re-sync when network returns
    },
    mutations: {
      retry: 0,
      networkMode: 'online',          // Only attempt write mutations when online
    },
  },
});
