import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface CalendarDatePickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  minDate?: Date;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  selectedDate,
  onSelectDate,
  minDate = new Date(),
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(selectedDate || minDate)
  );

  const startDay = startOfDay(minDate);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const daysInView = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const canGoPrevious = !isSameMonth(currentMonth, startDay) && !isBefore(currentMonth, startDay);

  const handlePrevMonth = () => {
    if (!canGoPrevious) return;
    Haptics.selectionAsync().catch(() => {});
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    Haptics.selectionAsync().catch(() => {});
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleDayPress = (day: Date) => {
    Haptics.selectionAsync().catch(() => {});
    // Preserve existing time (hours, minutes) when switching dates
    const newDate = new Date(day);
    newDate.setHours(selectedDate.getHours());
    newDate.setMinutes(selectedDate.getMinutes());
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    onSelectDate(newDate);
  };

  return (
    <View style={styles.container}>
      {/* Month Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          disabled={!canGoPrevious}
          style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
          accessibilityLabel="Previous month"
        >
          <ChevronLeft
            size={20}
            color={canGoPrevious ? colors.text.primary : colors.text.disabled}
          />
        </TouchableOpacity>

        <Text style={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>

        <TouchableOpacity
          onPress={handleNextMonth}
          style={styles.navButton}
          accessibilityLabel="Next month"
        >
          <ChevronRight size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Weekday Row */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((dayName, idx) => (
          <View key={idx} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{dayName}</Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.grid}>
        {daysInView.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isPast = isBefore(startOfDay(day), startDay);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const isDisabled = !isCurrentMonth || isPast;

          return (
            <TouchableOpacity
              key={index}
              disabled={isDisabled}
              onPress={() => handleDayPress(day)}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                isCurrentDay && !isSelected && styles.dayCellToday,
              ]}
              accessibilityLabel={format(day, 'MMMM d, yyyy')}
            >
              <Text
                style={[
                  styles.dayText,
                  !isCurrentMonth && styles.dayTextOutside,
                  isPast && styles.dayTextDisabled,
                  isCurrentDay && !isSelected && styles.dayTextToday,
                  isSelected && styles.dayTextSelected,
                ]}
              >
                {format(day, 'd')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  monthTitle: {
    ...typography.presets.subhead,
    color: colors.text.primary,
    fontWeight: '700',
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.background.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xxs,
  },
  weekdayText: {
    ...typography.presets.caption,
    color: colors.text.muted,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: colors.primary.DEFAULT,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: colors.primary.DEFAULT,
  },
  dayText: {
    ...typography.presets.body,
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  dayTextOutside: {
    color: colors.text.disabled,
    opacity: 0.3,
  },
  dayTextDisabled: {
    color: colors.text.disabled,
  },
  dayTextToday: {
    color: colors.primary.DEFAULT,
    fontWeight: '700',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

