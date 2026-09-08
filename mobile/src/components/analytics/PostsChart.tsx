import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BarChart, stackDataItem } from 'react-native-gifted-charts';
import { TrendingUp } from 'lucide-react-native';

import { PostsTimePoint } from '../../services/analytics/analyticsService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface PostsChartProps {
  data: PostsTimePoint[];
  title?: string;
  periodLabel?: string;
}

export const PostsChart: React.FC<PostsChartProps> = ({
  data,
  title = 'Broadcast Activity',
  periodLabel = 'Last 7 Days',
}) => {
  // Transform pre-calculated API data directly into gifted-charts stackData
  const stackData: stackDataItem[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => {
      const delivered = item.delivered || 0;
      const scheduled = item.scheduled || 0;
      const failed = item.failed || 0;
      const total = delivered + scheduled + failed;

      // Provide a subtle placeholder baseline if 0 so the day bar column is visible
      const stacks = total > 0
        ? [
            { value: delivered, color: '#2AABEE', marginBottom: 2 },
            { value: scheduled, color: '#FF9500', marginBottom: 2 },
            { value: failed, color: '#FF3B30' },
          ]
        : [{ value: 0.2, color: 'rgba(255, 255, 255, 0.08)' }];

      return {
        stacks,
        label: item.label,
      };
    });
  }, [data]);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.trendRow}>
            <TrendingUp size={13} color={colors.status.success} strokeWidth={2.5} />
            <Text style={styles.trendText}>{periodLabel}</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2AABEE' }]} />
            <Text style={styles.legendLabel}>Delivered</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
            <Text style={styles.legendLabel}>Scheduled</Text>
          </View>
        </View>
      </View>

      {/* Gifted Stacked Bar Chart */}
      <View style={styles.chartWrap}>
        <BarChart
          stackData={stackData}
          barWidth={data.length > 14 ? 8 : 16}
          spacing={data.length > 14 ? 10 : 20}
          height={130}
          roundedTop
          roundedBottom
          barBorderRadius={4}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor="rgba(255, 255, 255, 0.08)"
          rulesColor="rgba(255, 255, 255, 0.05)"
          rulesType="solid"
          noOfSections={3}
          yAxisTextStyle={styles.axisLabel}
          xAxisLabelTextStyle={styles.axisLabel}
          initialSpacing={12}
          isAnimated
          animationDuration={350}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16222F',
    borderRadius: borderRadius.lg + 2,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: 'rgba(42, 171, 238, 0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.presets.title3,
    color: colors.text.primary,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  trendText: {
    ...typography.presets.caption,
    color: colors.status.success,
    fontSize: 11,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  chartWrap: {
    marginTop: spacing.sm,
    alignItems: 'center',
    overflow: 'hidden',
  },
  axisLabel: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '600',
  },
});
