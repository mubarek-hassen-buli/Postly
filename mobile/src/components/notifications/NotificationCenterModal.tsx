import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Bell, CheckCheck, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useNotifications, useMarkNotificationsRead } from '../../hooks/useNotifications';
import { NotificationLogItem } from '../../services/notifications/notificationService';
import { NotificationCard } from './NotificationCard';
import { Card } from '../ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

export interface NotificationCenterModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  visible,
  onClose,
}) => {
  const [unreadOnly, setUnreadOnly] = useState(false);

  const {
    data: notificationsData,
    isLoading,
    isRefetching,
    refetch,
  } = useNotifications(unreadOnly ? true : undefined);

  const markReadMutation = useMarkNotificationsRead();

  const notifications = notificationsData?.results || [];

  const handleMarkAllRead = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    await markReadMutation.mutateAsync();
  };

  const handleItemPress = (item: NotificationLogItem) => {
    if (!item.is_read) {
      markReadMutation.mutate([item.id]);
    }
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      );
    }

    return (
      <Card style={styles.emptyCard}>
        <View style={styles.emptyIconCircle}>
          <Bell size={32} color={colors.primary.DEFAULT} />
        </View>
        <Text style={styles.emptyTitle}>No Notifications</Text>
        <Text style={styles.emptySubtitle}>
          {unreadOnly
            ? 'You have caught up with all your unread alerts!'
            : 'You will receive alerts here when your scheduled posts are broadcast.'}
        </Text>
      </Card>
    );
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
              <Text style={styles.title}>Activity & Alerts</Text>
              <Text style={styles.subtitle}>Broadcast results and Telegram alerts</Text>
            </View>

            <View style={styles.headerRight}>
              {notifications.some((n) => !n.is_read) && (
                <TouchableOpacity
                  onPress={handleMarkAllRead}
                  style={styles.markAllBtn}
                  accessibilityLabel="Mark all as read"
                >
                  <CheckCheck size={16} color={colors.primary.DEFAULT} style={styles.markAllIcon} />
                  <Text style={styles.markAllText}>Mark Read</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Chips */}
          <View style={styles.filtersRow}>
            <TouchableOpacity
              onPress={() => setUnreadOnly(false)}
              style={[styles.filterChip, !unreadOnly && styles.activeFilterChip]}
            >
              <Text style={[styles.filterText, !unreadOnly && styles.activeFilterText]}>
                All Alerts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setUnreadOnly(true)}
              style={[styles.filterChip, unreadOnly && styles.activeFilterChip]}
            >
              <Text style={[styles.filterText, unreadOnly && styles.activeFilterText]}>
                Unread Only
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notifications List */}
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NotificationCard notification={item} onPress={handleItemPress} />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={colors.primary.DEFAULT}
                colors={[colors.primary.DEFAULT]}
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
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
    height: '75%',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.subtle,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  markAllIcon: {
    marginRight: 4,
  },
  markAllText: {
    ...typography.presets.caption,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
    fontSize: 11,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  activeFilterChip: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  filterText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.presets.subhead,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    marginVertical: spacing.lg,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.presets.title3,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.md,
  },
});
