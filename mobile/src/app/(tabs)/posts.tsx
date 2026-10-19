import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useQueryClient } from '@tanstack/react-query';

import {
  usePosts,
  usePublishPostNow,
  useCancelScheduledPost,
  useDeletePost,
} from '../../hooks/usePosts';
import { PostItem } from '../../services/posts/postService';
import { PostCard } from '../../components/posts/PostCard';
import { NotificationBellButton } from '../../components/notifications/NotificationBellButton';
import {
  DashboardSearchBar,
  PostFilterTabs,
  PostStatusFilter,
} from '../../components/posts/PostFilterBar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, layout, spacing } from '../../theme/spacing';

export default function PostersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeStatus, setActiveStatus] = useState<PostStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Backend query status filter mapping
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
    refetch: refetchPosts,
  } = usePosts({
    status: apiStatusFilter,
    search: searchQuery.trim() || undefined,
  });

  const publishNowMutation = usePublishPostNow();
  const cancelScheduleMutation = useCancelScheduledPost();
  const deletePostMutation = useDeletePost();

  const allPosts = postsData?.results || [];

  // Client-side filtering for platform tabs (Telegram vs LinkedIn)
  const displayPosts = useMemo(() => {
    if (activeStatus === 'TELEGRAM') {
      return allPosts.filter((p) => p.targets && p.targets.length > 0);
    }
    if (activeStatus === 'LINKEDIN') {
      return allPosts.filter((p) => !p.targets || p.targets.length === 0);
    }
    return allPosts;
  }, [allPosts, activeStatus]);

  // If odd number of posts, pad with an empty slot so a single/odd card maintains its exact 2-column width
  const gridPosts = useMemo(() => {
    if (displayPosts.length > 0 && displayPosts.length % 2 !== 0) {
      return [
        ...displayPosts,
        { id: '__empty_grid_slot__', isEmptySlot: true } as PostItem & { isEmptySlot?: boolean },
      ];
    }
    return displayPosts as (PostItem & { isEmptySlot?: boolean })[];
  }, [displayPosts]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchPosts(),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePublishNow = async (postId: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await publishNowMutation.mutateAsync(postId);
    } catch (error: any) {
      console.warn('Publish now failed:', error);
      Alert.alert('Publish Failed', error?.message || 'Failed to dispatch post immediately.');
    }
  };

  const handleCancelSchedule = async (postId: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await cancelScheduleMutation.mutateAsync(postId);
    } catch (error: any) {
      console.warn('Cancel schedule failed:', error);
      Alert.alert('Cancel Failed', error?.message || 'Failed to cancel scheduled post.');
    }
  };

  const handleEditPost = (post: PostItem) => {
    Haptics.selectionAsync().catch(() => {});
    router.push({
      pathname: '/compose',
      params: { editPostId: post.id },
    });
  };

  const handleDeletePost = async (postId: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await deletePostMutation.mutateAsync(postId);
    } catch (error: any) {
      console.warn('Delete post failed:', error);
      Alert.alert(
        'Delete Failed',
        error?.message || 'Failed to delete the post from remote platforms. Changes were reverted.'
      );
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

  const renderHeader = () => {
    return (
      <View style={styles.headerSection}>
        {/* Title & Count Row */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.pageTitle}>Posters</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{displayPosts.length}</Text>
            </View>
          </View>
          <NotificationBellButton onPress={() => router.push('/notifications')} />
        </View>

        {/* Search Bar directly above the filters */}
        <DashboardSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search broadcasts..."
        />

        {/* Platform & Status Filter Pills */}
        <PostFilterTabs
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        key="posters-grid-2col"
        data={gridPosts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => {
          if ('isEmptySlot' in item && item.isEmptySlot) {
            return <View style={styles.emptySlot} pointerEvents="none" />;
          }
          return (
            <PostCard
              post={item}
              onPress={(p) =>
                router.push({
                  pathname: '/posts/[id]',
                  params: { id: p.id },
                })
              }
              onEdit={handleEditPost}
              onPublishNow={handlePublishNow}
              onCancelSchedule={handleCancelSchedule}
              onDelete={handleDeletePost}
            />
          );
        }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
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
    backgroundColor: colors.background.base,
  },
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: layout.tabBarClearance,
  },
  headerSection: {
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageTitle: {
    ...typography.presets.title1,
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  countBadge: {
    backgroundColor: colors.background.highlight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  countBadgeText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  gridRow: {
    gap: 12,
    marginBottom: 12,
  },
  emptySlot: {
    flex: 1,
    height: 250,
    backgroundColor: 'transparent',
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
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.presets.title2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.presets.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: spacing.xs,
  },
});
