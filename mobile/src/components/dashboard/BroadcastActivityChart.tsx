import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { MoreHorizontal, TrendingUp } from 'lucide-react-native';
import { format, subDays } from 'date-fns';

import { PostItem } from '../../services/posts/postService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface BroadcastActivityChartProps {
  posts: PostItem[];
}

interface DayData {
  dayLabel: string;
  deliveredCount: number;
  scheduledCount: number;
}

export const BroadcastActivityChart: React.FC<BroadcastActivityChartProps> = ({ posts }) => {
  // Aggregate real post counts over the last 7 days
  const chartData: DayData[] = useMemo(() => {
    const days: DayData[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const targetDate = subDays(now, i);
      const dateStr = format(targetDate, 'yyyy-MM-dd');
      const dayLabel = i === 0 ? 'Today' : format(targetDate, 'MMM d');

      const dayPosts = posts.filter((post) => {
        const postDate = post.scheduled_for || post.published_at || post.created_at;
        return postDate ? postDate.startsWith(dateStr) : false;
      });

      const delivered = dayPosts.filter((p) => p.status === 'PUBLISHED').length;
      const scheduled = dayPosts.filter((p) => p.status === 'SCHEDULED').length;

      days.push({
        dayLabel,
        deliveredCount: delivered,
        scheduledCount: scheduled,
      });
    }

    return days;
  }, [posts]);

  // Chart dimensions & scaling
  const chartWidth = 330;
  const chartHeight = 110;
  const colWidth = 10;
  const gap = 36;
  const startX = 18;
  const baselineY = 88;
  const maxBarHeight = 65;

  // Max value calculation for normalization
  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.deliveredCount, d.scheduledCount)),
    3 // Minimum scale ceiling so 0 or 1 looks natural
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Broadcast Activity</Text>
            <View style={styles.trendRow}>
              <TrendingUp size={13} color={colors.status.success} strokeWidth={2.5} />
              <Text style={styles.trendText}>Last 7 Days</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
            <MoreHorizontal size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary.DEFAULT }]} />
            <Text style={styles.legendLabel}>Delivered</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.status.warning }]} />
            <Text style={styles.legendLabel}>Scheduled</Text>
          </View>
        </View>

        {/* SVG Dual-Tone Bar Chart */}
        <View style={styles.chartContainer}>
          <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            <Defs>
              {/* Cyan Delivered Gradient */}
              <LinearGradient id="deliveredGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#54C0F8" stopOpacity="1" />
                <Stop offset="100%" stopColor="#2AABEE" stopOpacity="0.85" />
              </LinearGradient>

              {/* Amber Scheduled Gradient */}
              <LinearGradient id="scheduledGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFB340" stopOpacity="1" />
                <Stop offset="100%" stopColor="#FF9500" stopOpacity="0.85" />
              </LinearGradient>
            </Defs>

            {/* Baseline horizontal grid line */}
            <Rect
              x={0}
              y={baselineY}
              width={chartWidth}
              height={1}
              fill="rgba(255, 255, 255, 0.08)"
            />

            {chartData.map((d, index) => {
              const xPos = startX + index * gap;

              // Calculate proportional heights (with min height of 6 for visual presence)
              const delHeight = d.deliveredCount > 0
                ? Math.max(12, (d.deliveredCount / maxVal) * maxBarHeight)
                : 6;
              const schHeight = d.scheduledCount > 0
                ? Math.max(10, (d.scheduledCount / maxVal) * maxBarHeight)
                : 4;

              const delY = baselineY - delHeight;
              const schY = baselineY - schHeight;

              return (
                <React.Fragment key={index}>
                  {/* Delivered Bar (Cyan) */}
                  <Rect
                    x={xPos}
                    y={delY}
                    width={colWidth}
                    height={delHeight}
                    rx={5}
                    fill={d.deliveredCount > 0 ? 'url(#deliveredGrad)' : 'rgba(42, 171, 238, 0.2)'}
                  />

                  {/* Scheduled Bar (Amber) */}
                  <Rect
                    x={xPos + colWidth + 4}
                    y={schY}
                    width={colWidth}
                    height={schHeight}
                    rx={5}
                    fill={d.scheduledCount > 0 ? 'url(#scheduledGrad)' : 'rgba(255, 149, 0, 0.18)'}
                  />

                  {/* Day Label Text */}
                  <SvgText
                    x={xPos + colWidth + 2}
                    y={baselineY + 16}
                    fontSize="10"
                    fontWeight="600"
                    fill={index === chartData.length - 1 ? colors.text.primary : colors.text.muted}
                    textAnchor="middle"
                  >
                    {d.dayLabel}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    ...typography.presets.title3,
    color: colors.text.primary,
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: -0.3,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  trendText: {
    ...typography.presets.caption,
    color: colors.status.success,
    fontSize: 11,
    fontWeight: '700',
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  chartContainer: {
    marginTop: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
