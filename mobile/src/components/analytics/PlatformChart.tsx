import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart, pieDataItem } from 'react-native-gifted-charts';
import { Layers } from 'lucide-react-native';

import { PlatformDistributionItem } from '../../services/analytics/analyticsService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface PlatformChartProps {
  data: PlatformDistributionItem[];
  totalBroadcasts: number;
}

export const PlatformChart: React.FC<PlatformChartProps> = ({ data, totalBroadcasts }) => {
  // Transform pre-calculated API data directly into gifted-charts pieData
  const pieData: pieDataItem[] = useMemo(() => {
    if (!data || data.length === 0) {
      return [{ value: 1, color: colors.background.highlight, text: 'No Data' }];
    }

    const hasData = data.some((item) => item.value > 0);
    if (!hasData) {
      return [{ value: 1, color: colors.background.highlight }];
    }

    return data.map((item) => ({
      value: item.value > 0 ? item.value : 0.01,
      color: item.color,
      text: `${item.percentage.toFixed(0)}%`,
      textColor: '#FFFFFF',
      textSize: 10,
    }));
  }, [data]);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Layers size={16} color={colors.primary.DEFAULT} strokeWidth={2.5} />
          <Text style={styles.title}>Platform Distribution</Text>
        </View>
        <Text style={styles.subtitle}>Across Channels</Text>
      </View>

      {/* Donut Chart & Legend Row */}
      <View style={styles.bodyRow}>
        {/* Donut Pie Chart */}
        <View style={styles.chartWrapper}>
          <PieChart
            data={pieData}
            donut
            radius={56}
            innerRadius={38}
            innerCircleColor={colors.background.surface}
            isAnimated
            animationDuration={400}
            centerLabelComponent={() => (
              <View style={styles.centerLabelWrap}>
                <Text style={styles.centerValue}>{totalBroadcasts}</Text>
                <Text style={styles.centerCaption}>Posts</Text>
              </View>
            )}
          />
        </View>

        {/* Dynamic Platform Legend (supports any number of future platforms) */}
        <View style={styles.legendColumn}>
          {data.map((item) => (
            <View key={item.platform} style={styles.legendRow}>
              <View style={[styles.platformIndicator, { backgroundColor: item.color }]} />
              <View style={styles.platformTextWrap}>
                <Text style={styles.platformName} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={styles.platformVolume}>
                  {item.value} ({item.percentage.toFixed(1)}%)
                </Text>
              </View>
            </View>
          ))}
        </View>
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
    borderColor: colors.border.subtle,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    ...typography.presets.title3,
    color: colors.text.primary,
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 18,
  },
  centerCaption: {
    ...typography.presets.caption,
    color: colors.text.muted,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  legendColumn: {
    flex: 1,
    marginLeft: spacing.lg,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  platformTextWrap: {
    flex: 1,
  },
  platformName: {
    ...typography.presets.body,
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  platformVolume: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 1,
  },
});
