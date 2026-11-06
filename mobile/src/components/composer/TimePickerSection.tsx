import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock, Minus, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface TimePickerSectionProps {
  selectedDate: Date;
  onChangeTime: (hours: number, minutes: number) => void;
}

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTE_PRESETS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export const TimePickerSection: React.FC<TimePickerSectionProps> = ({
  selectedDate,
  onChangeTime,
}) => {
  const current24Hour = selectedDate.getHours();
  const currentMinute = selectedDate.getMinutes();

  const isPM = current24Hour >= 12;
  const current12Hour = current24Hour % 12 === 0 ? 12 : current24Hour % 12;

  const handleHourSelect = (hour12: number) => {
    Haptics.selectionAsync().catch(() => {});
    const new24Hour = isPM
      ? hour12 === 12
        ? 12
        : hour12 + 12
      : hour12 === 12
      ? 0
      : hour12;
    onChangeTime(new24Hour, currentMinute);
  };

  const handleMinuteSelect = (minute: number) => {
    Haptics.selectionAsync().catch(() => {});
    onChangeTime(current24Hour, minute);
  };

  const handlePeriodToggle = (period: 'AM' | 'PM') => {
    Haptics.selectionAsync().catch(() => {});
    if ((period === 'PM' && isPM) || (period === 'AM' && !isPM)) return;

    let new24Hour = current24Hour;
    if (period === 'PM' && !isPM) {
      new24Hour = current24Hour + 12;
    } else if (period === 'AM' && isPM) {
      new24Hour = current24Hour - 12;
    }
    onChangeTime(new24Hour, currentMinute);
  };

  const adjustMinute = (delta: number) => {
    Haptics.selectionAsync().catch(() => {});
    let nextMinute = currentMinute + delta;
    let nextHour = current24Hour;

    if (nextMinute >= 60) {
      nextMinute = 0;
      nextHour = (nextHour + 1) % 24;
    } else if (nextMinute < 0) {
      nextMinute = 59;
      nextHour = (nextHour - 1 + 24) % 24;
    }
    onChangeTime(nextHour, nextMinute);
  };

  return (
    <View style={styles.container}>
      {/* Header Display */}
      <View style={styles.headerRow}>
        <View style={styles.timePreview}>
          <Clock size={18} color={colors.primary.DEFAULT} />
          <Text style={styles.timeDisplayText}>
            {String(current12Hour).padStart(2, '0')}:
            {String(currentMinute).padStart(2, '0')}
          </Text>
        </View>

        {/* AM / PM Segmented Control */}
        <View style={styles.periodToggle}>
          <TouchableOpacity
            onPress={() => handlePeriodToggle('AM')}
            style={[styles.periodButton, !isPM && styles.periodButtonActive]}
          >
            <Text
              style={[styles.periodText, !isPM && styles.periodTextActive]}
            >
              AM
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlePeriodToggle('PM')}
            style={[styles.periodButton, isPM && styles.periodButtonActive]}
          >
            <Text
              style={[styles.periodText, isPM && styles.periodTextActive]}
            >
              PM
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hour Chips */}
      <Text style={styles.pickerLabel}>Hour</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        {HOURS.map((hour) => {
          const isSelected = current12Hour === hour;
          return (
            <TouchableOpacity
              key={hour}
              onPress={() => handleHourSelect(hour)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {hour}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Minute Chips & Stepper */}
      <View style={styles.minuteHeaderRow}>
        <Text style={styles.pickerLabel}>Minute</Text>
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            onPress={() => adjustMinute(-1)}
            style={styles.stepperButton}
            accessibilityLabel="Decrease 1 minute"
          >
            <Minus size={14} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.stepperValue}>
            {String(currentMinute).padStart(2, '0')}m
          </Text>
          <TouchableOpacity
            onPress={() => adjustMinute(1)}
            style={styles.stepperButton}
            accessibilityLabel="Increase 1 minute"
          >
            <Plus size={14} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        {MINUTE_PRESETS.map((minute) => {
          const isSelected = currentMinute === minute;
          return (
            <TouchableOpacity
              key={minute}
              onPress={() => handleMinuteSelect(minute)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                :{String(minute).padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginTop: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  timePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeDisplayText: {
    ...typography.presets.title2,
    color: colors.text.primary,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background.highlight,
    borderRadius: borderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  periodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  periodButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  periodText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pickerLabel: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  chipsScroll: {
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  chip: {
    minWidth: 42,
    height: 38,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  chipSelected: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  chipText: {
    ...typography.presets.subhead,
    color: colors.text.primary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  minuteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background.highlight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  stepperButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    ...typography.presets.caption,
    color: colors.text.primary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    paddingHorizontal: 2,
  },
});

