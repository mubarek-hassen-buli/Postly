import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { format, addMinutes, addHours, addDays, setHours, setMinutes } from 'date-fns';
import { Calendar, Check, Clock, Send, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

export interface SchedulePickerModalProps {
  visible: boolean;
  onClose: () => void;
  scheduledFor: string | null;
  onSelectSchedule: (isoString: string | null) => void;
}

export const SchedulePickerModal: React.FC<SchedulePickerModalProps> = ({
  visible,
  onClose,
  scheduledFor,
  onSelectSchedule,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    scheduledFor ? new Date(scheduledFor) : null
  );

  const getQuickPresets = () => {
    const now = new Date();
    const tonight = setMinutes(setHours(now, 20), 0);
    const tomorrowMorning = setMinutes(setHours(addDays(now, 1), 9), 0);

    return [
      {
        label: 'In 15 minutes',
        date: addMinutes(now, 15),
      },
      {
        label: 'In 1 hour',
        date: addHours(now, 1),
      },
      {
        label: 'Tonight at 8:00 PM',
        date: tonight > now ? tonight : addDays(tonight, 1),
      },
      {
        label: 'Tomorrow at 9:00 AM',
        date: tomorrowMorning,
      },
    ];
  };

  const handlePresetSelect = (date: Date) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedDate(date);
  };

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onSelectSchedule(selectedDate ? selectedDate.toISOString() : null);
    onClose();
  };

  const handleInstantPublish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSelectSchedule(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleArea}>
              <Text style={styles.title}>Schedule Publishing</Text>
              <Text style={styles.subtitle}>Choose when to broadcast this post</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Quick Presets */}
          <Text style={styles.sectionHeader}>Quick Shortcuts</Text>
          <View style={styles.presetsContainer}>
            {getQuickPresets().map((preset, index) => {
              const isSelected =
                selectedDate &&
                Math.abs(selectedDate.getTime() - preset.date.getTime()) < 60000;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePresetSelect(preset.date)}
                  style={[styles.presetRow, isSelected && styles.selectedPresetRow]}
                >
                  <View style={styles.presetLeft}>
                    <Clock size={16} color={isSelected ? colors.primary.DEFAULT : colors.text.muted} />
                    <Text style={[styles.presetLabel, isSelected && styles.selectedPresetLabel]}>
                      {preset.label}
                    </Text>
                  </View>
                  <Text style={styles.presetTime}>
                    {format(preset.date, 'EEE, h:mm a')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Schedule Banner */}
          {selectedDate && (
            <Card style={styles.selectedBanner}>
              <Calendar size={18} color={colors.primary.DEFAULT} style={styles.bannerIcon} />
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>Scheduled Time</Text>
                <Text style={styles.bannerValue}>
                  {format(selectedDate, 'MMMM d, yyyy @ h:mm a')}
                </Text>
              </View>
            </Card>
          )}

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Button
              title="Publish Instantly"
              variant="outline"
              size="md"
              onPress={handleInstantPublish}
              leftIcon={<Send size={16} color={colors.primary.DEFAULT} />}
              style={styles.actionBtn}
            />

            <Button
              title="Confirm Schedule"
              variant="primary"
              size="md"
              onPress={handleApply}
              disabled={!selectedDate}
              leftIcon={<Check size={16} color="#FFFFFF" />}
              style={styles.actionBtn}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.massive,
    borderTopWidth: 1.5,
    borderColor: colors.border.subtle,
    ...shadows.floating,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  titleArea: {
    flex: 1,
  },
  title: {
    ...typography.presets.title2,
    color: colors.text.primary,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    ...typography.presets.subheadMedium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  presetsContainer: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  selectedPresetRow: {
    backgroundColor: 'rgba(42, 171, 238, 0.15)',
  },
  presetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  presetLabel: {
    ...typography.presets.body,
    color: colors.text.primary,
  },
  selectedPresetLabel: {
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },
  presetTime: {
    ...typography.presets.caption,
    color: colors.text.secondary,
  },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 171, 238, 0.1)',
    borderColor: 'rgba(42, 171, 238, 0.3)',
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  bannerIcon: {
    marginRight: spacing.md,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    ...typography.presets.caption,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },
  bannerValue: {
    ...typography.presets.subhead,
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});
