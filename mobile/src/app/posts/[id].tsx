import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  Layers,
  Pin,
  Radio,
  Send,
  Share2,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react-native';

import {
  useCancelScheduledPost,
  useDeletePost,
  usePost,
  usePublishPostNow,
} from '../../hooks/usePosts';
import { PostChannelTargetItem, PostItem } from '../../services/posts/postService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, layout, spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PostDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const postId = Array.isArray(id) ? id[0] : id;
  const { data: post, isLoading, isError, refetch } = usePost(postId ?? null);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const publishMutation = usePublishPostNow();
  const cancelMutation = useCancelScheduledPost();
  const deleteMutation = useDeletePost();

  const handleCopyContent = () => {
    if (!post?.content) return;
    Clipboard.setString(post.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishNow = async () => {
    if (!postId) return;
    try {
      await publishMutation.mutateAsync(postId);
      Alert.alert('Broadcast Sent', 'Your post has been published to targeted channels.');
      refetch();
    } catch (err: any) {
      Alert.alert('Publish Failed', err?.message || 'Could not publish post immediately.');
    }
  };

  const handleCancelSchedule = async () => {
    if (!postId) return;
    Alert.alert(
      'Cancel Scheduled Broadcast',
      'Are you sure you want to stop this broadcast? It will be converted back to a draft.',
      [
        { text: 'Keep Scheduled', style: 'cancel' },
        {
          text: 'Cancel Broadcast',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelMutation.mutateAsync(postId);
              refetch();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to cancel schedule.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    if (!postId) return;
    Alert.alert(
      'Delete Post',
      'This action cannot be undone. Are you sure you want to remove this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(postId);
              router.back();
            } catch (err: any) {
              Alert.alert('Delete Failed', err?.message || 'Could not delete post.');
            }
          },
        },
      ]
    );
  };

  const getStatusBadge = (status: PostItem['status']) => {
    switch (status) {
      case 'PUBLISHED':
        return {
          label: 'Published',
          bg: 'rgba(52, 199, 89, 0.12)',
          text: '#34C759',
          icon: <CheckCircle2 size={13} color="#34C759" />,
        };
      case 'SCHEDULED':
        return {
          label: 'Scheduled',
          bg: 'rgba(42, 171, 238, 0.12)',
          text: '#2AABEE',
          icon: <Clock size={13} color="#2AABEE" />,
        };
      case 'PUBLISHING':
        return {
          label: 'Broadcasting...',
          bg: 'rgba(255, 149, 0, 0.12)',
          text: '#FF9500',
          icon: <ActivityIndicator size="small" color="#FF9500" />,
        };
      case 'FAILED':
        return {
          label: 'Broadcast Failed',
          bg: 'rgba(255, 59, 48, 0.12)',
          text: '#FF3B30',
          icon: <XCircle size={13} color="#FF3B30" />,
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          bg: 'rgba(142, 142, 147, 0.12)',
          text: '#8E8E93',
          icon: <Clock size={13} color="#8E8E93" />,
        };
      default:
        return {
          label: 'Draft',
          bg: 'rgba(100, 116, 139, 0.12)',
          text: '#64748B',
          icon: <FileText size={13} color="#64748B" />,
        };
    }
  };

  const renderTargetItem = (target: PostChannelTargetItem) => {
    const title = target.channel?.title || target.channel_title || 'Telegram Channel';
    const username = target.channel?.username || target.channel_username;
    const isSuccess = target.status === 'SUCCESS';
    const isFailed = target.status === 'FAILED';

    return (
      <View key={target.id || String(target.telegram_channel_id)} style={styles.targetRow}>
        <View style={styles.targetIconWrap}>
          <Radio size={16} color="#0088CC" />
        </View>

        <View style={styles.targetInfo}>
          <Text style={styles.targetTitle} numberOfLines={1}>
            {title}
          </Text>
          {username ? (
            <Text style={styles.targetUsername}>@{username}</Text>
          ) : (
            <Text style={styles.targetUsername}>Channel ID: {target.telegram_channel_id}</Text>
          )}

          {isFailed && target.error_message && (
            <Text style={styles.targetError} numberOfLines={2}>
              {target.error_message}
            </Text>
          )}
        </View>

        <View
          style={[
            styles.targetBadge,
            isSuccess && styles.targetBadgeSuccess,
            isFailed && styles.targetBadgeFailed,
          ]}
        >
          {isSuccess && <CheckCircle2 size={12} color="#34C759" style={styles.targetBadgeIcon} />}
          {isFailed && <XCircle size={12} color="#FF3B30" style={styles.targetBadgeIcon} />}
          <Text
            style={[
              styles.targetBadgeText,
              isSuccess && { color: '#34C759' },
              isFailed && { color: '#FF3B30' },
            ]}
          >
            {target.status}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Details</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.centerMessage}>Loading post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !post) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Details</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centerBox}>
          <AlertCircle size={44} color={colors.status.error} />
          <Text style={styles.errorTitle}>Post Not Found</Text>
          <Text style={styles.centerMessage}>This post could not be loaded or was removed.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const badge = getStatusBadge(post.status);
  const mediaList = post.media_attachments || [];
  const targets = post.targets || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top App Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Post Details</Text>

        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteHeaderButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Trash2 size={20} color={colors.status.error} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 24, 40) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary.DEFAULT}
          />
        }
      >
        {/* Status & Timing Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusBadgeRow}>
            <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
              {badge.icon}
              <Text style={[styles.badgePillText, { color: badge.text }]}>{badge.label}</Text>
            </View>

            {post.pin_message && (
              <View style={styles.pinBadge}>
                <Pin size={12} color="#0088CC" />
                <Text style={styles.pinBadgeText}>Pinned</Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            {post.scheduled_for && (
              <View style={styles.metaItem}>
                <Clock size={13} color={colors.text.secondary} />
                <Text style={styles.metaText}>
                  Scheduled: {format(new Date(post.scheduled_for), 'MMM d, yyyy · h:mm a')}
                </Text>
              </View>
            )}

            {post.published_at && (
              <View style={styles.metaItem}>
                <Calendar size={13} color={colors.text.secondary} />
                <Text style={styles.metaText}>
                  Published: {format(new Date(post.published_at), 'MMM d, yyyy · h:mm a')}
                </Text>
              </View>
            )}

            {!post.published_at && !post.scheduled_for && post.created_at && (
              <View style={styles.metaItem}>
                <Calendar size={13} color={colors.text.secondary} />
                <Text style={styles.metaText}>
                  Created: {format(new Date(post.created_at), 'MMM d, yyyy · h:mm a')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Media Attachments Section */}
        {mediaList.length > 0 && (
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: mediaList[activeMediaIndex]?.media_url }}
              style={styles.activeMediaImage}
              contentFit="cover"
              priority="high"
            />
            {mediaList.length > 1 && (
              <View style={styles.mediaThumbRow}>
                {mediaList.map((m, idx) => (
                  <TouchableOpacity
                    key={m.id || idx}
                    onPress={() => setActiveMediaIndex(idx)}
                    style={[
                      styles.thumbWrap,
                      activeMediaIndex === idx && styles.thumbWrapActive,
                    ]}
                  >
                    <Image source={{ uri: m.media_url }} style={styles.thumbImage} contentFit="cover" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Message Content Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleRow}>
              <FileText size={16} color={colors.primary.DEFAULT} />
              <Text style={styles.cardTitle}>Message Content</Text>
            </View>

            <TouchableOpacity
              onPress={handleCopyContent}
              style={styles.copyButton}
              activeOpacity={0.7}
            >
              <Copy size={13} color={copied ? colors.status.success : colors.text.secondary} />
              <Text style={[styles.copyButtonText, copied && { color: colors.status.success }]}>
                {copied ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.messageBox}>
            <Text style={styles.messageText} selectable>
              {post.content || post.text_content || 'No text content attached.'}
            </Text>
          </View>

          <View style={styles.formattingRow}>
            <Text style={styles.formattingBadge}>
              Format: {post.formatting_mode || 'HTML'}
            </Text>
            <Text style={styles.charCountText}>
              {(post.content || '').length} characters
            </Text>
          </View>
        </View>

        {/* Target Channels Delivery Breakdown */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleRow}>
              <Share2 size={16} color={colors.primary.DEFAULT} />
              <Text style={styles.cardTitle}>Broadcast Targets</Text>
            </View>
            <Text style={styles.targetCountBadge}>{targets.length} channels</Text>
          </View>

          {targets.length === 0 ? (
            <Text style={styles.emptyTargetText}>No channel targets specified for this post.</Text>
          ) : (
            <View style={styles.targetsList}>{targets.map(renderTargetItem)}</View>
          )}
        </View>

        {/* Primary Action Buttons */}
        <View style={styles.actionSection}>
          {post.status === 'SCHEDULED' && (
            <>
              <TouchableOpacity
                onPress={handlePublishNow}
                style={[styles.primaryBtn, { backgroundColor: '#0088CC' }]}
                activeOpacity={0.8}
                disabled={publishMutation.isPending}
              >
                {publishMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Zap size={18} color="#FFFFFF" />
                    <Text style={styles.primaryBtnText}>Publish Now</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancelSchedule}
                style={styles.secondaryBtn}
                activeOpacity={0.8}
                disabled={cancelMutation.isPending}
              >
                <Clock size={16} color={colors.status.error} />
                <Text style={[styles.secondaryBtnText, { color: colors.status.error }]}>
                  Cancel Schedule
                </Text>
              </TouchableOpacity>
            </>
          )}

          {(post.status === 'FAILED' || post.status === 'DRAFT') && (
            <TouchableOpacity
              onPress={handlePublishNow}
              style={[styles.primaryBtn, { backgroundColor: '#0088CC' }]}
              activeOpacity={0.8}
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Send size={18} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>
                    {post.status === 'FAILED' ? 'Retry Broadcast' : 'Publish Broadcast'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  headerTitle: {
    ...typography.presets.title2,
    color: '#0F172A',
    fontSize: 18,
  },
  deleteHeaderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statusBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  badgePillText: {
    ...typography.presets.caption,
    fontSize: 12,
    fontWeight: '700',
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 136, 204, 0.1)',
    gap: 4,
  },
  pinBadgeText: {
    ...typography.presets.caption,
    fontSize: 11,
    color: '#0088CC',
  },
  metaRow: {
    gap: 6,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...typography.presets.caption,
    color: '#64748B',
    fontSize: 12.5,
  },
  mediaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeMediaImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#F1F5F9',
  },
  mediaThumbRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
  },
  thumbWrap: {
    width: 52,
    height: 52,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbWrapActive: {
    borderColor: colors.primary.DEFAULT,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    ...typography.presets.title3,
    color: '#0F172A',
    fontSize: 15,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  copyButtonText: {
    ...typography.presets.caption,
    fontSize: 11,
    color: '#64748B',
  },
  messageBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    ...typography.presets.body,
    color: '#0F172A',
    fontSize: 15,
    lineHeight: 22,
  },
  formattingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  formattingBadge: {
    ...typography.presets.caption,
    fontSize: 11,
    color: '#94A3B8',
  },
  charCountText: {
    ...typography.presets.caption,
    fontSize: 11,
    color: '#94A3B8',
  },
  targetCountBadge: {
    ...typography.presets.caption,
    fontSize: 11.5,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  targetsList: {
    gap: 10,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  targetIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 136, 204, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  targetInfo: {
    flex: 1,
  },
  targetTitle: {
    ...typography.presets.bodyMedium,
    color: '#0F172A',
    fontSize: 14,
  },
  targetUsername: {
    ...typography.presets.caption,
    color: '#64748B',
    fontSize: 12,
    marginTop: 1,
  },
  targetError: {
    ...typography.presets.caption,
    color: colors.status.error,
    fontSize: 11,
    marginTop: 3,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  targetBadgeSuccess: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  targetBadgeFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  targetBadgeIcon: {
    marginRight: 4,
  },
  targetBadgeText: {
    ...typography.presets.caption,
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '700',
  },
  emptyTargetText: {
    ...typography.presets.body,
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
  actionSection: {
    gap: 12,
    marginTop: 8,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: { shadowColor: '#0088CC', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  primaryBtnText: {
    ...typography.presets.button,
    color: '#FFFFFF',
    fontSize: 16,
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    ...typography.presets.button,
    fontSize: 15,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerMessage: {
    ...typography.presets.body,
    color: '#64748B',
    marginTop: 10,
    textAlign: 'center',
  },
  errorTitle: {
    ...typography.presets.title2,
    color: '#0F172A',
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
    borderRadius: 20,
  },
  retryButtonText: {
    ...typography.presets.button,
    color: '#FFFFFF',
    fontSize: 14,
  },
});
