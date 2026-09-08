import { useQuery } from '@tanstack/react-query';
import { analyticsService, DashboardAnalyticsData } from '../services/analytics/analyticsService';

export const ANALYTICS_QUERY_KEY = ['analytics', 'dashboard'];

export function useDashboardAnalytics(period: '7d' | '30d' | 'all' = '7d') {
  return useQuery<DashboardAnalyticsData>({
    queryKey: [...ANALYTICS_QUERY_KEY, period],
    queryFn: () => analyticsService.getDashboardAnalytics(period),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}
