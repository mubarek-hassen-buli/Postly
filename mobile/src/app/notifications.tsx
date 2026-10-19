import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, CheckCheck, Clock, Radio, Sparkles } from 'lucide-react-native';

import { useMarkNotificationsRead, useNotifications } from '../hooks/useNotifications';
import { NotificationCard } from '../components/notifications/NotificationCard';
import { NotificationLogItem } from '../services/notifications/notificationService';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, layout, spacing } from '../theme/spacing';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const {
    data: notificationsData,
    isLoading,
    isRefetching,
    refetch,
  } = useNotifications(unreadOnly ? true : undefined);

  const markReadMutation = useMarkNotificationsRead();
  const notifications = notificationsData?.results || [];
  const hasUnread = notifications.some((n) => !n.is_read);

  const handleMarkAllRead = async () => {
    await markReadMutation.mutateAsync();
  };

  const handleItemPress = (item: NotificationLogItem) => {
    if (!item.is_read) {
      markReadMutation.mutate([item.id]);
    }
    // If notification relates to a post, navigate to post details
    const relatedPostId = (item as any).related_post_id || (item as any).post_id;
    if (relatedPostId) {
      router.push({
        pathname: '/posts/[id]',
        params: { id: String(relatedPostId) },
      });
    }
  };

  const renderHeader = () => (
    <View style={styles.filterBar}>
      <TouchableOpacity
        onPress={() => setUnreadOnly(false)}
        style={[styles.filterPill, !unreadOnly && styles.filterPillActive]}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterPillText, !unreadOnly && styles.filterPillTextActive]}>
          All Alerts
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setUnreadOnly(true)}
        style={[styles.filterPill, unreadOnly && styles.filterPillActive]}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterPillText, unreadOnly && styles.filterPillTextActive]}>
          Unread Only
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Bell size={36} color="#0088CC" />
        </View>
        <Text style={styles.emptyTitle}>
          {unreadOnly ? 'No Unread Alerts' : 'No Activity Yet'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {unreadOnly
            ? 'You are all caught up! All notifications have been read.'
            : 'You will receive notifications here when your posts are delivered to Telegram or LinkedIn.'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.titleColumn}>
          <Text style={styles.headerTitle}>Activity & Alerts</Text>
          <Text style={styles.headerSubtitle}>Broadcast results & logs</Text>
        </View>

        {hasUnread ? (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            style={styles.markAllBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={markReadMutation.isPending}
          >
            {markReadMutation.isPending ? (
              <ActivityIndicator size="small" color="#0088CC" />
            ) : (
              <>
                <CheckCheck size={16} color="#0088CC" />
                <Text style={styles.markAllBtnText}>Read All</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard notification={item} onPress={handleItemPress} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary.DEFAULT}
            colors={[colors.primary.DEFAULT]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.presets.title2,
    color: '#0F172A',
    fontSize: 18,
  },
  headerSubtitle: {
    ...typography.presets.caption,
    color: '#64748B',
    fontSize: 12,
    marginTop: 1,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 136, 204, 0.08)',
  },
  markAllBtnText: {
    ...typography.presets.caption,
    color: '#0088CC',
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterPillText: {
    ...typography.presets.caption,
    fontSize: 13,
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 136, 204, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...typography.presets.title2,
    color: '#0F172A',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.presets.body,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  centerBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.presets.caption,
    color: '#64748B',
    marginTop: 12,
  },
});
