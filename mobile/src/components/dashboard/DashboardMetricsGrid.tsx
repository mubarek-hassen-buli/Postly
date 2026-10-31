import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  CheckCircle2,
  Clock,
  Share2,
  TrendingUp,
} from 'lucide-react-native';
import { TelegramIcon } from '../common/BrandIcons';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface DashboardMetricsProps {
  totalBroadcasts: number;
  totalChannelsReach: number;
  scheduledQueueCount: number;
  deliverySuccessRate: number;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  trendText: string;
  trendType?: 'positive' | 'warning' | 'info';
  icon: React.ReactNode;
  badgeBg: string;
  badgeTextColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  trendText,
  trendType = 'positive',
  icon,
  badgeBg,
  badgeTextColor,
}) => {
  const getTrendStyle = () => {
    switch (trendType) {
      case 'warning':
        return {
          textColor: colors.status.warning,
          bg: colors.status.warningBg,
        };
      case 'info':
        return {
          textColor: colors.primary.light,
          bg: colors.primary.subtle,
        };
      default:
        return {
          textColor: colors.status.success,
          bg: colors.status.successBg,
        };
    }
  };

  const trendStyle = getTrendStyle();

  return (
    <View style={styles.card}>
      {/* Top Header Pill: Icon + Label */}
      <View style={styles.cardTopRow}>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <View style={styles.badgeIconWrap}>{icon}</View>
          <Text style={[styles.badgeText, { color: badgeTextColor }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </View>

      {/* Main Big Metric Number */}
      <Text style={styles.metricValue}>{value}</Text>

      {/* Trend / Status Indicator Pill */}
      <View style={styles.trendRow}>
        <View style={[styles.trendPill, { backgroundColor: trendStyle.bg }]}>
          <TrendingUp size={11} color={trendStyle.textColor} strokeWidth={2.5} style={styles.trendIcon} />
          <Text style={[styles.trendText, { color: trendStyle.textColor }]}>
            {trendText}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const DashboardMetricsGrid: React.FC<DashboardMetricsProps> = ({
  totalBroadcasts,
  totalChannelsReach,
  scheduledQueueCount,
  deliverySuccessRate,
}) => {
  return (
    <View style={styles.gridContainer}>
      <View style={styles.row}>
        {/* Card 1: Broadcasts */}
        <MetricCard
          label="Broadcasts"
          value={totalBroadcasts}
          trendText="Active"
          trendType="info"
          icon={<TelegramIcon size={14} color="#2AABEE" />}
          badgeBg="rgba(42, 171, 238, 0.12)"
          badgeTextColor="#54C0F8"
        />

        {/* Card 2: Channels Reach */}
        <MetricCard
          label="Channels"
          value={totalChannelsReach}
          trendText="Target Reach"
          trendType="positive"
          icon={<Share2 size={13} color="#34C759" strokeWidth={2.5} />}
          badgeBg="rgba(52, 199, 89, 0.12)"
          badgeTextColor="#34C759"
        />
      </View>

      <View style={styles.row}>
        {/* Card 3: Scheduled Queue */}
        <MetricCard
          label="Queue"
          value={scheduledQueueCount}
          trendText={scheduledQueueCount > 0 ? 'Pending' : 'All Sent'}
          trendType={scheduledQueueCount > 0 ? 'warning' : 'positive'}
          icon={<Clock size={13} color="#FF9500" strokeWidth={2.5} />}
          badgeBg="rgba(255, 149, 0, 0.12)"
          badgeTextColor="#FF9500"
        />

        {/* Card 4: Delivery Rate */}
        <MetricCard
          label="Delivery Rate"
          value={`${deliverySuccessRate.toFixed(1)}%`}
          trendText="Reliable"
          trendType="positive"
          icon={<CheckCircle2 size={13} color="#34C759" strokeWidth={2.5} />}
          badgeBg="rgba(52, 199, 89, 0.12)"
          badgeTextColor="#34C759"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: spacing.sm + 2,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
  card: {
    flex: 1,
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: borderRadius.round,
  },
  badgeIconWrap: {
    marginRight: 4,
  },
  badgeText: {
    ...typography.presets.caption,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  metricValue: {
    ...typography.presets.title1,
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: borderRadius.round,
  },
  trendIcon: {
    marginRight: 3,
  },
  trendText: {
    ...typography.presets.caption,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
