import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { format, formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Pin,
  Send,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react-native';

import { PostItem } from '../../services/posts/postService';
import { Card } from '../ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

export interface PostCardProps {
  post: PostItem;
  onPress: (post: PostItem) => void;
  onPublishNow?: (postId: string) => void;
  onCancelSchedule?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  onPublishNow,
  onCancelSchedule,
  onDelete,
}) => {
  const getStatusBadge = () => {
    switch (post.status) {
      case 'PUBLISHED':
        return {
          label: 'Published',
          bg: colors.status.successBg,
          text: colors.status.success,
          icon: <CheckCircle size={12} color={colors.status.success} />,
        };
      case 'SCHEDULED':
        return {
          label: 'Scheduled',
          bg: colors.status.warningBg,
          text: colors.status.warning,
          icon: <Clock size={12} color={colors.status.warning} />,
        };
      case 'FAILED':
        return {
          label: 'Failed',
          bg: colors.status.errorBg,
          text: colors.status.error,
          icon: <AlertCircle size={12} color={colors.status.error} />,
        };
      case 'PUBLISHING':
        return {
          label: 'Publishing...',
          bg: colors.primary.subtle,
          text: colors.primary.DEFAULT,
          icon: <Send size={12} color={colors.primary.DEFAULT} />,
        };
      default:
        return {
          label: 'Draft',
          bg: colors.background.elevated,
          text: colors.text.muted,
          icon: <FileText size={12} color={colors.text.muted} />,
        };
    }
  };

  const statusBadge = getStatusBadge();

  const handlePublishNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(
      'Publish Now',
      'Are you sure you want to broadcast this scheduled post immediately?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          style: 'default',
          onPress: () => onPublishNow?.(post.id),
        },
      ]
    );
  };

  const handleCancelSchedule = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert(
      'Cancel Schedule',
      'This will cancel the scheduled broadcast and return the post to Draft status.',
      [
        { text: 'Keep Scheduled', style: 'cancel' },
        {
          text: 'Cancel Broadcast',
          style: 'destructive',
          onPress: () => onCancelSchedule?.(post.id),
        },
      ]
    );
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(post.id),
        },
      ]
    );
  };

  const getCleanPreviewText = (text?: string | null): string => {
    if (!text) return '';
    return text
      .replace(/<[^>]+>/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .trim();
  };

  const mediaAttachments = post.media_attachments || [];
  const targets = post.targets || [];

  return (
    <Card style={styles.card}>
      <Pressable onPress={() => onPress(post)} style={styles.cardHeader}>
        {/* Status Pill */}
        <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
          {statusBadge.icon}
          <Text style={[styles.statusText, { color: statusBadge.text }]}>
            {statusBadge.label}
          </Text>
        </View>

        {/* Pin Badge */}
        {post.pin_message && (
          <View style={styles.pinBadge}>
            <Pin size={12} color={colors.primary.DEFAULT} />
            <Text style={styles.pinText}>Pinned</Text>
          </View>
        )}

        <View style={styles.headerSpacer} />

        {/* Time / Date */}
        {post.scheduled_for && post.status === 'SCHEDULED' ? (
          <View style={styles.timeRow}>
            <Calendar size={12} color={colors.text.secondary} style={styles.timeIcon} />
            <Text style={styles.timeText}>
              {format(new Date(post.scheduled_for), 'MMM d, h:mm a')}
            </Text>
          </View>
        ) : post.published_at ? (
          <Text style={styles.timeText}>
            {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
          </Text>
        ) : (
          <Text style={styles.timeText}>
            {format(new Date(post.created_at || Date.now()), 'MMM d')}
          </Text>
        )}
      </Pressable>

      {/* Main Content & Thumbnail */}
      <Pressable onPress={() => onPress(post)} style={styles.bodyRow}>
        <View style={styles.textContainer}>
          <Text style={styles.contentText} numberOfLines={3}>
            {getCleanPreviewText(post.content) || (mediaAttachments.length > 0 ? '(Media only)' : '')}
          </Text>
        </View>

        {/* Media Thumbnail Preview */}
        {mediaAttachments.length > 0 && mediaAttachments[0]?.media_url && (
          <View style={styles.thumbnailWrapper}>
            <Image
              source={{ uri: mediaAttachments[0].media_url }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            {mediaAttachments.length > 1 && (
              <View style={styles.mediaCountBadge}>
                <ImageIcon size={10} color="#FFFFFF" />
                <Text style={styles.mediaCountText}>
                  +{mediaAttachments.length - 1}
                </Text>
              </View>
            )}
          </View>
        )}
      </Pressable>

      {/* Target Channel Destination Pills */}
      {targets.length > 0 && (
        <View style={styles.destinationsRow}>
          {targets.map((target) => {
            const isSuccess = target.status === 'SUCCESS';
            const isFailed = target.status === 'FAILED';
            const title = target.channel?.title || 'Telegram Channel';

            return (
              <View
                key={target.id}
                style={[
                  styles.channelPill,
                  isSuccess && styles.channelSuccessPill,
                  isFailed && styles.channelFailedPill,
                ]}
              >
                {isSuccess ? (
                  <CheckCircle size={10} color={colors.status.success} />
                ) : isFailed ? (
                  <XCircle size={10} color={colors.status.error} />
                ) : (
                  <Clock size={10} color={colors.text.muted} />
                )}
                <Text style={styles.channelTitle} numberOfLines={1}>
                  {title}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Error Notice if Failed */}
      {post.error_summary && post.status === 'FAILED' && (
        <View style={styles.errorBanner}>
          <AlertCircle size={14} color={colors.status.error} style={styles.errorIcon} />
          <Text style={styles.errorText} numberOfLines={1}>
            {post.error_summary}
          </Text>
        </View>
      )}

      {/* Quick Action Footer */}
      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          <Text style={styles.formatModeText}>{post.formatting_mode} Format</Text>
        </View>

        <View style={styles.footerActions}>
          {post.status === 'SCHEDULED' && (
            <>
              <TouchableOpacity
                onPress={handlePublishNow}
                style={styles.actionButton}
                accessibilityLabel="Publish Now"
              >
                <Zap size={14} color={colors.primary.DEFAULT} style={styles.actionIcon} />
                <Text style={[styles.actionText, { color: colors.primary.DEFAULT }]}>
                  Publish Now
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancelSchedule}
                style={styles.actionButton}
                accessibilityLabel="Cancel Schedule"
              >
                <Clock size={14} color={colors.status.warning} style={styles.actionIcon} />
                <Text style={[styles.actionText, { color: colors.status.warning }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          )}

          {post.status === 'FAILED' && onPublishNow && (
            <TouchableOpacity
              onPress={() => onPublishNow(post.id)}
              style={styles.actionButton}
            >
              <Zap size={14} color={colors.primary.DEFAULT} style={styles.actionIcon} />
              <Text style={[styles.actionText, { color: colors.primary.DEFAULT }]}>
                Retry
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Delete post"
          >
            <Trash2 size={15} color={colors.text.muted} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  statusText: {
    ...typography.presets.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary.subtle,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    marginLeft: spacing.xs,
  },
  pinText: {
    ...typography.presets.caption,
    color: colors.primary.DEFAULT,
    fontSize: 10,
    fontWeight: '600',
  },
  headerSpacer: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: 4,
  },
  timeText: {
    ...typography.presets.caption,
    color: colors.text.muted,
  },
  bodyRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  contentText: {
    ...typography.presets.body,
    color: colors.text.primary,
    lineHeight: 20,
  },
  thumbnailWrapper: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.background.elevated,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  mediaCountBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  mediaCountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  destinationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.sm,
  },
  channelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background.input,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    maxWidth: 140,
  },
  channelSuccessPill: {
    borderColor: 'rgba(52, 199, 89, 0.3)',
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
  },
  channelFailedPill: {
    borderColor: 'rgba(255, 59, 48, 0.3)',
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
  },
  channelTitle: {
    ...typography.presets.caption,
    fontSize: 11,
    color: colors.text.secondary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.errorBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
    marginBottom: spacing.sm,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    ...typography.presets.caption,
    color: colors.status.error,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing.xs + 2,
  },
  footerLeft: {
    flex: 1,
  },
  formatModeText: {
    ...typography.presets.caption,
    color: colors.text.muted,
    fontSize: 10,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.input,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  actionIcon: {
    marginRight: 4,
  },
  actionText: {
    ...typography.presets.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 2,
  },
});
