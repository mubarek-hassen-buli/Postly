import { apiClient } from '../api/client';

export interface MetricSummary {
  total_broadcasts: number;
  channels_reach: number;
  scheduled_queue_count: number;
  delivery_success_rate: number;
  published_count: number;
  failed_count: number;
  draft_count: number;
}

export interface PostsTimePoint {
  date: string;
  label: string;
  delivered: number;
  scheduled: number;
  failed: number;
}

export interface PlatformDistributionItem {
  platform: string;
  label: string;
  value: number;
  color: string;
  percentage: number;
}

export interface EngagementMetrics {
  total_targets_reached: number;
  average_reach_per_broadcast: number;
  delivery_reliability_score: number;
}

export interface DashboardAnalyticsData {
  period: string;
  summary: MetricSummary;
  posts_chart: {
    period: string;
    data: PostsTimePoint[];
  };
  platform_distribution: PlatformDistributionItem[];
  engagement_metrics: EngagementMetrics;
}

export const analyticsService = {
  /**
   * Fetches aggregated dashboard analytics, time-series post stats,
   * and multi-platform distribution data from the Django backend.
   */
  async getDashboardAnalytics(period: '7d' | '30d' | 'all' = '7d'): Promise<DashboardAnalyticsData> {
    const response = await apiClient.get<DashboardAnalyticsData>('/analytics/dashboard/', {
      params: { period },
    });
    return response.data;
  },
};
