import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Calendar,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Zap,
} from 'lucide-react-native';

import { PostsTimePoint } from '../../services/analytics/analyticsService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface ConsistencyCardProps {
  data: PostsTimePoint[];
  reliabilityScore: number;
  averageReach: number;
  totalTargetsReached: number;
}

function getWeekdayInitial(label: string): string {
  if (label === 'Today') {
    return 'T';
  }
  return label.charAt(0);
}

export const ConsistencyCard: React.FC<ConsistencyCardProps> = ({
  data,
  reliabilityScore,
  averageReach,
  totalTargetsReached,
}) => {
  // Compute publishing cadence metrics from daily data points
  const { activeDays, totalDays, isWeekly } = useMemo(() => {
    if (!data || data.length === 0) {
      return { activeDays: 0, totalDays: 0, isWeekly: true };
    }

    const active = data.filter((item) => (item.delivered || 0) + (item.scheduled || 0) > 0).length;
    return {
      activeDays: active,
      totalDays: data.length,
      isWeekly: data.length <= 7,
    };
  }, [data]);

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Delivery & Consistency</Text>
          <Text style={styles.subtitle}>Publishing Rhythm & Target Reach</Text>
        </View>

        {/* Reliability Score Badge */}
        <View style={styles.reliabilityBadge}>
          <ShieldCheck size={12} color="#34C759" strokeWidth={2.5} />
          <Text style={styles.reliabilityText}>
            {reliabilityScore.toFixed(0)}% Reliable
          </Text>
        </View>
      </View>

      {/* 3-Column Key Stats Row */}
      <View style={styles.statsRow}>
        {/* Active Days */}
        <View style={styles.statCol}>
          <View style={styles.statIconWrap}>
            <Calendar size={13} color={colors.primary.DEFAULT} strokeWidth={2.5} />
          </View>
          <Text style={styles.statValue}>
            {activeDays}
            <Text style={styles.statValueTotal}>/{totalDays || 7}</Text>
          </Text>
          <Text style={styles.statLabel}>Active Days</Text>
        </View>

        <View style={styles.statDivider} />

        {/* Average Multiplier */}
        <View style={styles.statCol}>
          <View style={styles.statIconWrap}>
            <Zap size={13} color="#FF9500" strokeWidth={2.5} />
          </View>
          <Text style={styles.statValue}>{averageReach.toFixed(1)}x</Text>
          <Text style={styles.statLabel}>Avg. Reach</Text>
        </View>

        <View style={styles.statDivider} />

        {/* Total Targets Reached */}
        <View style={styles.statCol}>
          <View style={styles.statIconWrap}>
            <TrendingUp size={13} color="#34C759" strokeWidth={2.5} />
          </View>
          <Text style={styles.statValue}>{totalTargetsReached}</Text>
          <Text style={styles.statLabel}>Dispatches</Text>
        </View>
      </View>

      {/* 7-Day Pulse Row (Only for 7-Day View) */}
      {isWeekly && data && data.length > 0 && (
        <View style={styles.pulseContainer}>
          <Text style={styles.pulseTitle}>7-Day Broadcast Pulse</Text>
          <View style={styles.pulseRow}>
            {data.map((item, index) => {
              const delivered = item.delivered || 0;
              const scheduled = item.scheduled || 0;
              const isActive = delivered > 0;
              const isScheduled = scheduled > 0 && !isActive;

              // Extract clean 1-letter weekday or 'T' for Today
              const dayLetter = getWeekdayInitial(item.label);

              return (
                <View key={`${item.date}-${index}`} style={styles.pulseItem}>
                  <View
                    style={[
                      styles.pulseCircle,
                      isActive && styles.pulseCircleActive,
                      isScheduled && styles.pulseCircleScheduled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pulseCircleText,
                        (isActive || isScheduled) && styles.pulseCircleTextActive,
                      ]}
                    >
                      {dayLetter}
                    </Text>
                  </View>
                  <Text style={styles.pulseDayLabel} numberOfLines={1}>
                    {item.label === 'Today' ? 'Today' : item.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* System Health Status Footer */}
      <View style={styles.healthFooter}>
        <CheckCircle2 size={13} color="#34C759" strokeWidth={2.5} />
        <Text style={styles.healthText}>
          {reliabilityScore >= 95
            ? 'All connected channel targets synced and ready for broadcasting.'
            : 'Some dispatches required retries. Verify channel permissions.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.lg + 2,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.presets.title3,
    color: colors.text.primary,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  subtitle: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 2,
  },
  reliabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
  },
  reliabilityText: {
    ...typography.presets.caption,
    color: '#34C759',
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.highlight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm + 2,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statIconWrap: {
    marginBottom: 2,
  },
  statValue: {
    ...typography.presets.title3,
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  statValueTotal: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: '600',
  },
  statLabel: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border.subtle,
  },
  pulseContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  pulseTitle: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  pulseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pulseItem: {
    alignItems: 'center',
    gap: 4,
  },
  pulseCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.highlight,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircleActive: {
    backgroundColor: '#0088CC',
    borderColor: '#0088CC',
  },
  pulseCircleScheduled: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  pulseCircleText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.muted,
  },
  pulseCircleTextActive: {
    color: '#FFFFFF',
  },
  pulseDayLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  healthFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.sm,
  },
  healthText: {
    ...typography.presets.caption,
    color: '#15803D',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
});
