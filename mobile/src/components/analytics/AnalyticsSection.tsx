import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  CheckCircle2,
  Clock,
  Radio,
  Share2,
} from 'lucide-react-native';

import { useDashboardAnalytics } from '../../hooks/useAnalytics';
import { MetricCard } from './MetricCard';
import { PostsChart } from './PostsChart';
import { PlatformChart } from './PlatformChart';
import { EngagementChart } from './EngagementChart';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export type AnalyticsPeriod = '7d' | '30d' | 'all';

export interface AnalyticsSectionProps {
  initialPeriod?: AnalyticsPeriod;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ initialPeriod = '7d' }) => {
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod);

  // Consume pre-aggregated analytics from the Django backend via TanStack Query
  const { data, isLoading, isError, refetch } = useDashboardAnalytics(period);

  const handlePeriodChange = (newPeriod: AnalyticsPeriod) => {
    if (newPeriod === period) return;
    Haptics.selectionAsync().catch(() => {});
    setPeriod(newPeriod);
  };

  const periodTabs: Array<{ key: AnalyticsPeriod; label: string }> = [
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: 'all', label: 'All' },
  ];



  const summary = data?.summary || {
    total_broadcasts: 0,
    channels_reach: 0,
    scheduled_queue_count: 0,
    delivery_success_rate: 100,
    published_count: 0,
    failed_count: 0,
    draft_count: 0,
  };

  const postsChartData = data?.posts_chart?.data || [];
  const platformDistribution = data?.platform_distribution || [];
  const engagementMetrics = data?.engagement_metrics || {
    total_targets_reached: 0,
    average_reach_per_broadcast: 1,
    delivery_reliability_score: summary.delivery_success_rate,
  };

  const periodLabel = period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'All Time';

  return (
    <View style={styles.container}>
      {/* Header: Title & Timeframe Selector Pills */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.titleWithLoader}>
          <Text style={styles.sectionHeading}>Performance & Reach</Text>
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={colors.primary.DEFAULT}
              style={styles.headerSpinner}
            />
          )}
        </View>

        <View style={styles.periodPillsWrap}>
          {periodTabs.map((tab) => {
            const isActive = tab.key === period;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handlePeriodChange(tab.key)}
                activeOpacity={0.7}
                style={[styles.periodPill, isActive && styles.activePeriodPill]}
              >
                <Text style={[styles.periodPillText, isActive && styles.activePeriodPillText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 1. 2x2 MetricCard Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricsRow}>
          <MetricCard
            label="Broadcasts"
            value={summary.total_broadcasts}
            trendText="Active"
            trendType="info"
            icon={<Radio size={13} color="#2AABEE" strokeWidth={2.5} />}
            badgeBg="rgba(42, 171, 238, 0.10)"
            badgeTextColor={colors.primary.DEFAULT}
          />

          <MetricCard
            label="Channels"
            value={summary.channels_reach}
            trendText="Target Reach"
            trendType="positive"
            icon={<Share2 size={13} color="#34C759" strokeWidth={2.5} />}
            badgeBg="rgba(52, 199, 89, 0.12)"
            badgeTextColor="#34C759"
          />
        </View>

        <View style={styles.metricsRow}>
          <MetricCard
            label="Queue"
            value={summary.scheduled_queue_count}
            trendText={summary.scheduled_queue_count > 0 ? 'Pending' : 'All Sent'}
            trendType={summary.scheduled_queue_count > 0 ? 'warning' : 'positive'}
            icon={<Clock size={13} color="#FF9500" strokeWidth={2.5} />}
            badgeBg="rgba(255, 149, 0, 0.12)"
            badgeTextColor="#FF9500"
          />

          <MetricCard
            label="Delivery Rate"
            value={`${summary.delivery_success_rate.toFixed(1)}%`}
            trendText="Reliable"
            trendType="positive"
            icon={<CheckCircle2 size={13} color="#34C759" strokeWidth={2.5} />}
            badgeBg="rgba(52, 199, 89, 0.12)"
            badgeTextColor="#34C759"
          />
        </View>
      </View>

      {/* 2. Gifted Stacked Bar Chart: Broadcast Activity */}
      <PostsChart
        data={postsChartData}
        title="Broadcast Activity"
        periodLabel={periodLabel}
      />

      {/* 3. Gifted Donut Pie Chart: Platform Distribution */}
      <PlatformChart
        data={platformDistribution}
        totalBroadcasts={summary.total_broadcasts}
      />

      {/* 4. Gifted Curved Area Line Chart: Trajectory Volume */}
      <EngagementChart
        data={postsChartData}
        reliabilityScore={engagementMetrics.delivery_reliability_score}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingVertical: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 2,
  },
  sectionHeading: {
    ...typography.presets.title3,
    color: colors.text.primary,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  titleWithLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerSpinner: {
    marginLeft: 4,
  },
  periodPillsWrap: {
    flexDirection: 'row',
    backgroundColor: colors.background.highlight,
    borderRadius: borderRadius.round,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  periodPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
  },
  activePeriodPill: {
    backgroundColor: colors.primary.DEFAULT,
  },
  periodPillText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  activePeriodPillText: {
    color: '#FFFFFF',
  },
  metricsGrid: {
    gap: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
});
