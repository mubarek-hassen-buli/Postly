import React, { useState, useEffect } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  addDays,
  addHours,
  addMinutes,
  format,
  isBefore,
  setHours,
  setMinutes,
} from 'date-fns';
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  Clock,
  Send,
  Sparkles,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { CalendarDatePicker } from './CalendarDatePicker';
import { TimePickerSection } from './TimePickerSection';
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

type TabMode = 'shortcuts' | 'custom';

export const SchedulePickerModal: React.FC<SchedulePickerModalProps> = ({
  visible,
  onClose,
  scheduledFor,
  onSelectSchedule,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('shortcuts');
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (scheduledFor) {
      const parsed = new Date(scheduledFor);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return addHours(new Date(), 1);
  });

  // Sync state when modal becomes visible or scheduledFor changes
  useEffect(() => {
    if (visible) {
      if (scheduledFor) {
        const parsed = new Date(scheduledFor);
        if (!isNaN(parsed.getTime())) {
          setSelectedDate(parsed);
          setActiveTab('custom');
          return;
        }
      }
      setSelectedDate(addHours(new Date(), 1));
    }
  }, [visible, scheduledFor]);

  const getQuickPresets = () => {
    const now = new Date();
    const tonight = setMinutes(setHours(now, 20), 0);
    const tomorrowMorning = setMinutes(setHours(addDays(now, 1), 9), 0);
    const inTwoDays = setMinutes(setHours(addDays(now, 2), 10), 0);

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
      {
        label: 'In 2 Days at 10:00 AM',
        date: inTwoDays,
      },
    ];
  };

  const handlePresetSelect = (date: Date) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedDate(date);
  };

  const handleCustomDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCustomTimeChange = (hours: number, minutes: number) => {
    const updated = new Date(selectedDate);
    updated.setHours(hours);
    updated.setMinutes(minutes);
    updated.setSeconds(0);
    updated.setMilliseconds(0);
    setSelectedDate(updated);
  };

  // Validation: Must be at least 2 minutes in the future
  const minimumAllowed = addMinutes(new Date(), 2);
  const isPastOrTooClose = isBefore(selectedDate, minimumAllowed);

  const handleApply = () => {
    if (isPastOrTooClose) {
      Alert.alert(
        'Invalid Schedule Time',
        'Please select a time at least 2 minutes in the future.'
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onSelectSchedule(selectedDate.toISOString());
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
        <Pressable
          style={styles.sheetContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleArea}>
              <Text style={styles.title}>Schedule Publishing</Text>
              <Text style={styles.subtitle}>
                Choose when to broadcast this post
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close schedule modal"
            >
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Segmented View Mode */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setActiveTab('shortcuts');
              }}
              style={[
                styles.segmentTab,
                activeTab === 'shortcuts' && styles.segmentTabActive,
              ]}
            >
              <Sparkles
                size={16}
                color={
                  activeTab === 'shortcuts'
                    ? colors.primary.DEFAULT
                    : colors.text.muted
                }
              />
              <Text
                style={[
                  styles.segmentText,
                  activeTab === 'shortcuts' && styles.segmentTextActive,
                ]}
              >
                Quick Shortcuts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setActiveTab('custom');
              }}
              style={[
                styles.segmentTab,
                activeTab === 'custom' && styles.segmentTabActive,
              ]}
            >
              <CalendarIcon
                size={16}
                color={
                  activeTab === 'custom'
                    ? colors.primary.DEFAULT
                    : colors.text.muted
                }
              />
              <Text
                style={[
                  styles.segmentText,
                  activeTab === 'custom' && styles.segmentTextActive,
                ]}
              >
                Custom Date & Time
              </Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {activeTab === 'shortcuts' ? (
              <View style={styles.presetsContainer}>
                {getQuickPresets().map((preset, index) => {
                  const isSelected =
                    Math.abs(selectedDate.getTime() - preset.date.getTime()) <
                    60000;

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handlePresetSelect(preset.date)}
                      style={[
                        styles.presetRow,
                        isSelected && styles.selectedPresetRow,
                      ]}
                    >
                      <View style={styles.presetLeft}>
                        <Clock
                          size={16}
                          color={
                            isSelected
                              ? colors.primary.DEFAULT
                              : colors.text.muted
                          }
                        />
                        <Text
                          style={[
                            styles.presetLabel,
                            isSelected && styles.selectedPresetLabel,
                          ]}
                        >
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
            ) : (
              <View style={styles.customContainer}>
                <CalendarDatePicker
                  selectedDate={selectedDate}
                  onSelectDate={handleCustomDateSelect}
                  minDate={new Date()}
                />
                <TimePickerSection
                  selectedDate={selectedDate}
                  onChangeTime={handleCustomTimeChange}
                />
              </View>
            )}

            {/* Validation Notice if date is in the past */}
            {isPastOrTooClose && (
              <View style={styles.warningBanner}>
                <AlertCircle size={16} color={colors.status.error} />
                <Text style={styles.warningText}>
                  Scheduled time must be at least 2 minutes in the future.
                </Text>
              </View>
            )}

            {/* Selected Schedule Banner */}
            <Card style={styles.selectedBanner}>
              <CalendarIcon
                size={18}
                color={colors.primary.DEFAULT}
                style={styles.bannerIcon}
              />
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>Scheduled Time</Text>
                <Text style={styles.bannerValue}>
                  {format(selectedDate, 'EEEE, MMMM d, yyyy @ h:mm a')}
                </Text>
              </View>
            </Card>
          </ScrollView>

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
              disabled={isPastOrTooClose}
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
    padding: spacing.lg,
    paddingBottom: spacing.massive,
    maxHeight: '92%',
    borderTopWidth: 1.5,
    borderColor: colors.border.subtle,
    ...shadows.floating,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.highlight,
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderRadius: borderRadius.md,
  },
  segmentTabActive: {
    backgroundColor: colors.background.surface,
    ...shadows.card,
  },
  segmentText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: colors.primary.DEFAULT,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: spacing.sm,
  },
  presetsContainer: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
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
    backgroundColor: 'rgba(42, 171, 238, 0.12)',
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
  customContainer: {
    marginBottom: spacing.md,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.status.errorBg,
    borderColor: colors.status.errorBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningText: {
    ...typography.presets.caption,
    color: colors.status.error,
    fontWeight: '600',
    flex: 1,
  },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 171, 238, 0.08)',
    borderColor: 'rgba(42, 171, 238, 0.25)',
    marginBottom: spacing.md,
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
    paddingTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
});
