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
  // 1. Calculate maximum posts on any day in the period
  const maxDayTotal = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(
      ...data.map((d) => (d.delivered || 0) + (d.scheduled || 0) + (d.failed || 0)),
      0
    );
  }, [data]);

  // Lock Y-axis scale to clean whole integers (e.g. 0, 1, 2, 3 or 0, 2, 4, 6) - never decimals
  const noOfSections = 3;
  const maxValue = useMemo(() => {
    if (maxDayTotal <= 0) return 3;
    if (maxDayTotal <= 3) return 3;
    return Math.ceil(maxDayTotal / noOfSections) * noOfSections;
  }, [maxDayTotal]);

  const stepValue = maxValue / noOfSections;

  // 2. Transform pre-calculated API data with clean milestone labels
  const totalDays = data?.length || 0;
  const is30Days = totalDays > 7 && totalDays <= 31;
  const is90Days = totalDays > 31;

  const stackData: stackDataItem[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item, index) => {
      const delivered = item.delivered || 0;
      const scheduled = item.scheduled || 0;
      const failed = item.failed || 0;
      const total = delivered + scheduled + failed;

      // Smart milestone labeling to avoid crowded, overlapping letters
      let displayLabel = '';
      if (totalDays <= 7) {
        displayLabel = item.label;
      } else if (is30Days) {
        // Only label 5 milestone days: start, day 7, 14, 21, and the last day
        const isMilestone =
          index === 0 ||
          index === 7 ||
          index === 14 ||
          index === 21 ||
          index === totalDays - 1;

        if (isMilestone) {
          if (item.label === 'Today' || index === totalDays - 1) {
            displayLabel = 'Today';
          } else {
            const parts = item.label.split(' ');
            displayLabel = parts.length >= 2 ? `${parts[0]} ${parseInt(parts[1], 10)}` : item.label;
          }
        }
      } else {
        // In 90-day mode ("All"), only label 4 broad milestones
        const isMilestone =
          index === 0 ||
          index === Math.floor(totalDays * 0.33) ||
          index === Math.floor(totalDays * 0.66) ||
          index === totalDays - 1;

        if (isMilestone) {
          displayLabel = index === totalDays - 1 ? 'Today' : item.label.split(' ')[0] || item.label;
        }
      }

      // Provide a subtle placeholder baseline if 0 so the day bar column is visible
      const stacks = total > 0
        ? [
            { value: delivered, color: '#2AABEE', marginBottom: 2 },
            { value: scheduled, color: '#FF9500', marginBottom: 2 },
            { value: failed, color: '#FF3B30' },
          ]
        : [{ value: 0.06, color: colors.background.highlight }];

      return {
        stacks,
        label: displayLabel,
      };
    });
  }, [data, is30Days, is90Days, totalDays]);

  // Responsive bar width and spacing based on period
  const barWidth = is90Days ? 2 : is30Days ? 4 : 16;
  const spacing = is90Days ? 1.5 : is30Days ? 5 : 20;
  const initialSpacing = is30Days ? 8 : 12;

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
          barWidth={barWidth}
          spacing={spacing}
          height={130}
          roundedTop
          roundedBottom
          barBorderRadius={3}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={colors.border.subtle}
          rulesColor="rgba(0, 0, 0, 0.04)"
          rulesType="solid"
          maxValue={maxValue}
          stepValue={stepValue}
          noOfSections={noOfSections}
          formatYLabel={(val) => Math.round(Number(val)).toString()}
          yAxisLabelWidth={20}
          yAxisTextStyle={styles.axisLabel}
          xAxisLabelTextStyle={styles.axisLabel}
          initialSpacing={initialSpacing}
          isAnimated
          animationDuration={350}
        />
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
