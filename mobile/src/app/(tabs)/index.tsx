import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, CheckCircle, FileText, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import {
  usePosts,
  usePublishPostNow,
  useCancelScheduledPost,
  useDeletePost,
} from '../../hooks/usePosts';
import { PostItem } from '../../services/posts/postService';
import { PostCard } from '../../components/posts/PostCard';
import { PostFilterBar, PostStatusFilter } from '../../components/posts/PostFilterBar';
import { PostDetailModal } from '../../components/posts/PostDetailModal';
import { NotificationBellButton } from '../../components/notifications/NotificationBellButton';
import { NotificationCenterModal } from '../../components/notifications/NotificationCenterModal';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export default function PostsScreen() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<PostStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<PostItem | null>(null);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  // Queries & Mutations
  const {
    data: postsData,
    isLoading,
    isRefetching,
    refetch,
  } = usePosts({
    status: activeStatus !== 'ALL' ? (activeStatus as any) : undefined,
    search: searchQuery.trim() || undefined,
  });

  const publishNowMutation = usePublishPostNow();
  const cancelScheduleMutation = useCancelScheduledPost();
  const deletePostMutation = useDeletePost();

  const posts = postsData?.results || [];

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
    if (isLoading) {
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
          <Text style={styles.emptyTitle}>No matching posts</Text>
          <Text style={styles.emptySubtitle}>
            No posts found for {activeStatus !== 'ALL' ? activeStatus.toLowerCase() : ''} filter.
          </Text>
          <Button
            title="View All Posts"
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
          title="Compose First Post"
          onPress={() => router.push('/compose')}
          leftIcon={<Plus size={18} color="#FFFFFF" />}
          style={styles.emptyButton}
        />
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Broadcasts</Text>
          <Text style={styles.headerSubtitle}>Manage scheduled and published posts</Text>
        </View>

        <View style={styles.headerRightActions}>
          <NotificationBellButton onPress={() => setNotificationsVisible(true)} />

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              router.push('/compose');
            }}
            style={styles.newPostButton}
            accessibilityLabel="Compose new post"
          >
            <Plus size={16} color="#FFFFFF" style={styles.plusIcon} />
            <Text style={styles.newPostText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs & Search */}
      <PostFilterBar
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={(p) => setSelectedPostForDetail(p)}
            onPublishNow={handlePublishNow}
            onCancelSchedule={handleCancelSchedule}
            onDelete={handleDeletePost}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.presets.title1,
    color: colors.text.primary,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  newPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
  },
  plusIcon: {
    marginRight: 4,
  },
  newPostText: {
    ...typography.presets.subheadMedium,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.massive,
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
    marginVertical: spacing.xl,
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
    ...typography.presets.title3,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.presets.subhead,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    marginTop: spacing.xs,
  },
});
