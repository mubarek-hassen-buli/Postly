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
import { ScreenHeaderBanner, CurvedSheet } from '../components/common/ScreenHeaderBanner';
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
    <View style={styles.container}>
      <ScreenHeaderBanner
        compact={true}
        showBackButton={true}
        title="Activity & Alerts"
        rightActions={
          hasUnread ? (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              style={styles.frostedMarkAllBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={markReadMutation.isPending}
              accessibilityLabel="Mark all as read"
            >
              {markReadMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <CheckCheck size={16} color="#FFFFFF" />
                  <Text style={styles.frostedMarkAllText}>Read All</Text>
                </>
              )}
            </TouchableOpacity>
          ) : undefined
        }
      />

      <CurvedSheet>
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
      </CurvedSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0077B6',
  },
  frostedMarkAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  frostedMarkAllText: {
    ...typography.presets.caption,
    fontFamily: 'Fredoka-SemiBold',
    color: '#FFFFFF',
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
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
