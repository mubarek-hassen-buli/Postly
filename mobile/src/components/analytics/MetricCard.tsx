import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface MetricCardProps {
  label: string;
  value: string | number;
  trendText: string;
  trendType?: 'positive' | 'warning' | 'info';
  icon: React.ReactNode;
  badgeBg?: string;
  badgeTextColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  trendText,
  trendType = 'positive',
  icon,
  badgeBg = 'rgba(42, 171, 238, 0.10)',
  badgeTextColor = colors.primary.DEFAULT,
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
          textColor: colors.primary.DEFAULT,
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
      {/* Top Header Badge: Icon + Label */}
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

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
