import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';
import { ShieldCheck } from 'lucide-react-native';

import { PostsTimePoint } from '../../services/analytics/analyticsService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface EngagementChartProps {
  data: PostsTimePoint[];
  reliabilityScore: number;
}

export const EngagementChart: React.FC<EngagementChartProps> = ({ data, reliabilityScore }) => {
  // Transform pre-calculated API data directly into gifted-charts lineData
  const lineData: lineDataItem[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      value: item.delivered + item.scheduled,
      label: item.label,
      dataPointText: undefined,
    }));
  }, [data]);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Delivery Volume</Text>
          <Text style={styles.subtitle}>Broadcast Trajectory</Text>
        </View>

        {/* Reliability Score Badge */}
        <View style={styles.reliabilityBadge}>
          <ShieldCheck size={12} color={colors.status.success} strokeWidth={2.5} />
          <Text style={styles.reliabilityText}>{reliabilityScore.toFixed(1)}% Reliable</Text>
        </View>
      </View>

      {/* Gifted Area Line Chart */}
      <View style={styles.chartWrap}>
        <LineChart
          data={lineData}
          areaChart
          curved
          color="#2AABEE"
          thickness={2.5}
          startFillColor="rgba(42, 171, 238, 0.3)"
          endFillColor="rgba(42, 171, 238, 0.01)"
          startOpacity={0.8}
          endOpacity={0.1}
          dataPointsColor="#54C0F8"
          dataPointsRadius={4}
          height={110}
          spacing={data.length > 14 ? 12 : 32}
          initialSpacing={12}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor="rgba(255, 255, 255, 0.08)"
          rulesColor="rgba(255, 255, 255, 0.04)"
          rulesType="solid"
          noOfSections={3}
          yAxisTextStyle={styles.axisLabel}
          xAxisLabelTextStyle={styles.axisLabel}
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
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
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
    fontSize: 15,
    letterSpacing: -0.2,
  },
  subtitle: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 1,
  },
  reliabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.successBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
    gap: 4,
  },
  reliabilityText: {
    ...typography.presets.caption,
    color: colors.status.success,
    fontSize: 11,
    fontWeight: '700',
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
