import React from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { format, formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Paperclip,
  Pin,
  Send,
  Share2,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react-native';

import { PostItem } from '../../services/posts/postService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface PostCardProps {
  post: PostItem;
  onPress: (post: PostItem) => void;
  onPublishNow?: (postId: string) => void;
  onCancelSchedule?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  onPublishNow,
  onCancelSchedule,
  onDelete,
  style,
}) => {
  const mediaAttachments = post.media_attachments || [];
  const targets = post.targets || [];

  const getCleanPreviewText = (text?: string | null): string => {
    if (!text) return '';
    return text
      .replace(/<[^>]+>/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .trim();
  };

  const cleanText = getCleanPreviewText(post.text_content || post.content) || (mediaAttachments.length > 0 ? 'Media broadcast' : 'Draft broadcast');
  const titleSnippet = cleanText.split('\n')[0].slice(0, 48) + (cleanText.length > 48 ? '...' : '');

  // Determine platform identity & destination subtitle
  const isLinkedIn = targets.length === 0 && post.status === 'PUBLISHED';
  const hasMultipleTargets = targets.length > 1;

  const destinationLabel = hasMultipleTargets
    ? `Telegram (${targets.length} channels)`
    : targets.length === 1
    ? targets[0]?.channel?.title || 'Telegram Channel'
    : 'Social Broadcast';

  // Status configuration
  const getStatusBadge = () => {
    switch (post.status) {
      case 'PUBLISHED':
        return {
          label: 'Published',
          bg: colors.status.successBg,
          text: colors.status.success,
          icon: <CheckCircle2 size={11} color={colors.status.success} strokeWidth={2.5} />,
        };
      case 'SCHEDULED':
        return {
          label: 'Scheduled',
          bg: colors.status.warningBg,
          text: colors.status.warning,
          icon: <Clock size={11} color={colors.status.warning} strokeWidth={2.5} />,
        };
      case 'FAILED':
        return {
          label: 'Failed',
          bg: colors.status.errorBg,
          text: colors.status.error,
          icon: <AlertCircle size={11} color={colors.status.error} strokeWidth={2.5} />,
        };
      case 'PUBLISHING':
        return {
          label: 'Sending...',
          bg: colors.primary.subtle,
          text: colors.primary.DEFAULT,
          icon: <Send size={11} color={colors.primary.DEFAULT} strokeWidth={2.5} />,
        };
      default:
        return {
          label: 'Draft',
          bg: colors.background.elevated,
          text: colors.text.muted,
          icon: <FileText size={11} color={colors.text.muted} strokeWidth={2.5} />,
        };
    }
  };

  const statusBadge = getStatusBadge();

  // Action handlers
  const handlePublishNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(
      'Publish Now',
      'Broadcast this scheduled post immediately to all target channels?',
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
      'Return this scheduled broadcast to draft status?',
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
    const isSent = post.status === 'PUBLISHED';
    const message = isSent
      ? 'This will permanently delete this post from Postly and remove it from your Telegram channels and LinkedIn feed.'
      : 'Are you sure you want to delete this broadcast?';

    Alert.alert(
      'Delete Post',
      message,
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

  // 3-dot context menu
  const handleOpenActionMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    const options: string[] = ['View Details'];
    const actions: Array<() => void> = [() => onPress(post)];

    if (post.status === 'SCHEDULED') {
      options.push('Publish Now');
      actions.push(handlePublishNow);
      options.push('Cancel Schedule');
      actions.push(handleCancelSchedule);
    } else if (post.status === 'FAILED' && onPublishNow) {
      options.push('Retry Broadcast');
      actions.push(() => onPublishNow(post.id));
    }

    options.push('Delete');
    actions.push(handleDelete);
    options.push('Cancel');

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          destructiveButtonIndex: options.indexOf('Delete'),
          title: 'Broadcast Actions',
        },
        (buttonIndex) => {
          if (buttonIndex < actions.length) {
            actions[buttonIndex]();
          }
        }
      );
    } else {
      Alert.alert(
        'Broadcast Actions',
        titleSnippet,
        options.map((opt, idx) => ({
          text: opt,
          style: opt === 'Delete' ? 'destructive' : opt === 'Cancel' ? 'cancel' : 'default',
          onPress: idx < actions.length ? actions[idx] : undefined,
        }))
      );
    }
  };

  return (
    <Pressable
      onPress={() => onPress(post)}
      style={({ pressed }) => [styles.card, style, pressed && styles.cardPressed]}
    >
      {/* Top Main Row: Platform Icon + Content Snippet + 3-Dot Action Button */}
      <View style={styles.topRow}>
        {/* Platform Avatar Icon Circle */}
        <View style={styles.platformAvatar}>
          {isLinkedIn ? (
            <Share2 size={16} color="#0A66C2" strokeWidth={2.5} />
          ) : (
            <Send size={16} color="#2AABEE" strokeWidth={2.5} style={styles.airplaneIcon} />
          )}
        </View>

        {/* Center: Title Snippet & Destination */}
        <View style={styles.contentColumn}>
          <Text style={styles.postTitle} numberOfLines={1}>
            {titleSnippet}
          </Text>
          <Text style={styles.destinationText} numberOfLines={1}>
            {destinationLabel}
          </Text>
        </View>

        {/* Right: 3-Dot Menu Button */}
        <TouchableOpacity
          onPress={handleOpenActionMenu}
          style={styles.moreButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Broadcast options"
        >
          <MoreVertical size={16} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Body Content Preview (if multi-line or longer than single title) */}
      {(cleanText.length > titleSnippet.length || cleanText.includes('\n')) && (
        <Text style={styles.bodyPreview} numberOfLines={2}>
          {cleanText}
        </Text>
      )}

      {/* Media Thumbnail preview if image attached */}
      {mediaAttachments.length > 0 && mediaAttachments[0]?.media_url && (
        <View style={styles.thumbnailWrapper}>
          <Image
            source={{ uri: mediaAttachments[0].media_url }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          {mediaAttachments.length > 1 && (
            <View style={styles.mediaCountBadge}>
              <ImageIcon size={11} color="#FFFFFF" />
              <Text style={styles.mediaCountText}>+{mediaAttachments.length - 1}</Text>
            </View>
          )}
        </View>
      )}

      {/* Bottom Metadata Badges Row */}
      <View style={styles.metadataRow}>
        <View style={styles.metadataPills}>
          {/* Status Badge */}
          <View style={[styles.statusPill, { backgroundColor: statusBadge.bg }]}>
            {statusBadge.icon}
            <Text style={[styles.statusPillText, { color: statusBadge.text }]}>
              {statusBadge.label}
            </Text>
          </View>

          {/* Media Count Pill */}
          {mediaAttachments.length > 0 && (
            <View style={styles.metaChip}>
              <Paperclip size={11} color={colors.text.secondary} />
              <Text style={styles.metaChipText}>{mediaAttachments.length}</Text>
            </View>
          )}

          {/* Pin Tag */}
          {post.pin_message && (
            <View style={styles.metaChip}>
              <Pin size={11} color={colors.primary.DEFAULT} />
              <Text style={[styles.metaChipText, { color: colors.primary.DEFAULT }]}>Pinned</Text>
            </View>
          )}
        </View>

        {/* Schedule / Sent Timestamp */}
        <View style={styles.timestampWrap}>
          {post.scheduled_for && post.status === 'SCHEDULED' ? (
            <View style={styles.scheduleRow}>
              <Calendar size={11} color={colors.status.warning} />
              <Text style={[styles.timestampText, { color: colors.status.warning }]}>
                {format(new Date(post.scheduled_for), 'MMM d, h:mm a')}
              </Text>
            </View>
          ) : post.published_at ? (
            <Text style={styles.timestampText}>
              {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
            </Text>
          ) : (
            <Text style={styles.timestampText}>
              {format(new Date(post.created_at || Date.now()), 'MMM d')}
            </Text>
          )}
        </View>
      </View>

      {/* Error Alert Notice if Failed */}
      {post.error_summary && post.status === 'FAILED' && (
        <View style={styles.errorNotice}>
          <AlertCircle size={13} color={colors.status.error} style={styles.errorIcon} />
          <Text style={styles.errorNoticeText} numberOfLines={1}>
            {post.error_summary}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: {
    backgroundColor: colors.background.elevated,
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(42, 171, 238, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs + 2,
  },
  airplaneIcon: {
    marginLeft: -1,
  },
  contentColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  postTitle: {
    ...typography.presets.body,
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: -0.2,
  },
  destinationText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 1,
  },
  moreButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginLeft: spacing.xs,
  },
  bodyPreview: {
    ...typography.presets.body,
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: spacing.xs + 2,
  },
  thumbnailWrapper: {
    marginTop: spacing.xs + 2,
    borderRadius: borderRadius.sm + 2,
    overflow: 'hidden',
    height: 85,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.elevated,
  },
  mediaCountBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
    gap: 4,
  },
  mediaCountText: {
    ...typography.presets.caption,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  metadataRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 5,
    marginTop: spacing.xs + 4,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  metadataPills: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    gap: 3,
  },
  statusPillText: {
    ...typography.presets.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: borderRadius.round,
    gap: 4,
  },
  metaChipText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  timestampWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestampText: {
    ...typography.presets.caption,
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  errorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.errorBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorNoticeText: {
    ...typography.presets.caption,
    color: colors.status.error,
    fontSize: 11,
    flex: 1,
  },
});
