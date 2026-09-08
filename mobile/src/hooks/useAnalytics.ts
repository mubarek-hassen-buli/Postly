import { useQuery } from '@tanstack/react-query';
import { analyticsService, DashboardAnalyticsData } from '../services/analytics/analyticsService';

export const ANALYTICS_QUERY_KEY = ['analytics'];

export function useDashboardAnalytics(period: '7d' | '30d' | 'all' = '7d') {
  return useQuery<DashboardAnalyticsData>({
    queryKey: [...ANALYTICS_QUERY_KEY, 'dashboard', period],
    queryFn: () => analyticsService.getDashboardAnalytics(period),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

