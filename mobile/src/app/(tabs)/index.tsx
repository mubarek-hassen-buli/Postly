import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FileText, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import {
  usePosts,
  usePublishPostNow,
  useCancelScheduledPost,
  useDeletePost,
} from '../../hooks/usePosts';
import { useAuthStore } from '../../store/useAuthStore';
import { PostItem } from '../../services/posts/postService';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { AnalyticsSection } from '../../components/analytics/AnalyticsSection';
import { PostCard } from '../../components/posts/PostCard';
import { PostFilterBar, PostStatusFilter } from '../../components/posts/PostFilterBar';
import { PostDetailModal } from '../../components/posts/PostDetailModal';
import { NotificationCenterModal } from '../../components/notifications/NotificationCenterModal';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export default function PostsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [activeStatus, setActiveStatus] = useState<PostStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<PostItem | null>(null);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  // Backend Query Status filter mapping
  const apiStatusFilter = useMemo(() => {
    if (activeStatus === 'ALL' || activeStatus === 'TELEGRAM' || activeStatus === 'LINKEDIN') {
      return undefined;
    }
    return activeStatus;
  }, [activeStatus]);

  // Queries & Mutations
  const {
    data: postsData,
    isLoading: isPostsLoading,
    isRefetching: isPostsRefetching,
    refetch: refetchPosts,
  } = usePosts({
    status: apiStatusFilter,
    search: searchQuery.trim() || undefined,
  });

  const publishNowMutation = usePublishPostNow();
  const cancelScheduleMutation = useCancelScheduledPost();
  const deletePostMutation = useDeletePost();

  const allPosts = postsData?.results || [];

  // Client-side filtering for platform-specific tabs (Telegram vs LinkedIn)
  const displayPosts = useMemo(() => {
    if (activeStatus === 'TELEGRAM') {
      return allPosts.filter((p) => p.targets && p.targets.length > 0);
    }
    if (activeStatus === 'LINKEDIN') {
      return allPosts.filter((p) => !p.targets || p.targets.length === 0);
    }
    return allPosts;
  }, [allPosts, activeStatus]);

  const handleRefresh = async () => {
    await refetchPosts();
  };

  const handlePublishNow = async (postId: string) => {
    try {
      await publishNowMutation.mutateAsync(postId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (error: any) {
      console.warn('Publish now failed:', error);
    }
  };

  const handleCancelSchedule = async (postId: string) => {
    try {
      await cancelScheduleMutation.mutateAsync(postId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (error: any) {
      console.warn('Cancel schedule failed:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePostMutation.mutateAsync(postId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (error: any) {
      console.warn('Delete post failed:', error);
    }
  };

  const renderEmptyState = () => {
    if (isPostsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading broadcasts...</Text>
        </View>
      );
    }

    if (searchQuery || activeStatus !== 'ALL') {
      return (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No matching broadcasts</Text>
          <Text style={styles.emptySubtitle}>
            No broadcasts found matching your filter criteria.
          </Text>
          <Button
            title="Clear Filters"
            variant="outline"
            size="sm"
            onPress={() => {
              setSearchQuery('');
              setActiveStatus('ALL');
            }}
            style={styles.emptyButton}
          />
        </Card>
      );
    }

    return (
      <Card style={styles.emptyCard}>
        <View style={styles.emptyIconContainer}>
          <FileText size={36} color={colors.primary.DEFAULT} />
        </View>
        <Text style={styles.emptyTitle}>No Broadcasts Yet</Text>
        <Text style={styles.emptySubtitle}>
          Compose your first multi-channel post with rich text formatting, media attachments, and instant or scheduled delivery.
        </Text>
        <Button
          title="Compose First Broadcast"
          onPress={() => router.push('/compose')}
          leftIcon={<Plus size={18} color="#FFFFFF" />}
          style={styles.emptyButton}
        />
      </Card>
    );
  };

  // Assembled Header Component for FlatList
  const renderDashboardHeader = () => {
    return (
      <View style={styles.dashboardHeaderWrap}>
        {/* 1. Hero Greeting & Actions */}
        <DashboardHeader
          userName={user?.first_name || user?.username || 'Creator'}
          avatarUrl={user?.avatar_url}
          onOpenNotifications={() => setNotificationsVisible(true)}
        />

        {/* 2. Decoupled Analytics Section (Metrics Grid + Gifted Stacked Bar + Donut + Area Charts) */}
        <AnalyticsSection />

        {/* 3. Platform & Status Filter Pills */}
        <PostFilterBar
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* 4. Section Header for Broadcast Feed */}
        <View style={styles.feedHeaderRow}>
          <Text style={styles.feedSectionTitle}>Recent & Scheduled</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{displayPosts.length}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={displayPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardItemWrapper}>
            <PostCard
              post={item}
              onPress={(p) => setSelectedPostForDetail(p)}
              onPublishNow={handlePublishNow}
              onCancelSchedule={handleCancelSchedule}
              onDelete={handleDeletePost}
            />
          </View>
        )}
        ListHeaderComponent={renderDashboardHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isPostsRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary.DEFAULT}
            colors={[colors.primary.DEFAULT]}
          />
        }
      />

      {/* Post Detailed Modal */}
      <PostDetailModal
        post={selectedPostForDetail}
        visible={Boolean(selectedPostForDetail)}
        onClose={() => setSelectedPostForDetail(null)}
        onPublishNow={handlePublishNow}
        onCancelSchedule={handleCancelSchedule}
        onDelete={handleDeletePost}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  dashboardHeaderWrap: {
    marginBottom: spacing.xs,
  },
  cardItemWrapper: {
    paddingHorizontal: spacing.lg,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  feedSectionTitle: {
    ...typography.presets.title3,
    color: colors.text.primary,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: colors.background.surface,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  countBadgeText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.presets.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: spacing.md,
  },
  emptyIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.presets.title2,
    color: colors.text.primary,
    fontWeight: '800',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.presets.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    minWidth: 180,
  },
});
