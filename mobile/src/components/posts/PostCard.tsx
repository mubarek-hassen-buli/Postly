import React, { useRef, useState } from 'react';
import {
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
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Paperclip,
  Pin,
  RefreshCw,
  Send,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react-native';
import { TelegramIcon, LinkedInIcon } from '../common/BrandIcons';
import { ActionMenuModal, ActionMenuItem, ActionMenuSection } from '../common/ActionMenuModal';

import { PostItem } from '../../services/posts/postService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface PostCardProps {
  post: PostItem;
  onPress: (post: PostItem) => void;
  onEdit?: (post: PostItem) => void;
  onPublishNow?: (postId: string) => void;
  onCancelSchedule?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  onEdit,
  onPublishNow,
  onCancelSchedule,
  onDelete,
  style,
}) => {
  const mediaAttachments = post.media_attachments || [];
  const targets = post.targets || [];
  const firstMedia = mediaAttachments.find((m) => Boolean(m.media_url));
  const hasImage = Boolean(firstMedia?.media_url);

  const getCleanPreviewText = (text?: string | null): string => {
    if (!text) return '';
    return text
      .replace(/<[^>]+>/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .trim();
  };

  const cleanText =
    getCleanPreviewText(post.text_content || post.content) ||
    (hasImage ? 'Media broadcast' : 'Draft broadcast');
  const titleSnippet =
    cleanText.split('\n')[0].slice(0, 52) + (cleanText.length > 52 ? '...' : '');

  // Determine platform identity & destination subtitle
  const isLinkedIn = targets.length === 0 && post.status === 'PUBLISHED';
  const hasMultipleTargets = targets.length > 1;

  const destinationLabel = hasMultipleTargets
    ? `Telegram (${targets.length})`
    : targets.length === 1
    ? targets[0]?.channel?.title || 'Telegram Channel'
    : 'Social Broadcast';

  // Status configuration for both light surfaces and full-bleed image overlays
  const getStatusBadge = () => {
    switch (post.status) {
      case 'PUBLISHED':
        return {
          label: 'Published',
          bg: colors.status.successBg,
          text: colors.status.success,
          icon: <CheckCircle2 size={10} color={colors.status.success} strokeWidth={2.5} />,
          overlayBg: 'rgba(22, 163, 74, 0.9)',
          overlayTextColor: '#FFFFFF',
          overlayIcon: <CheckCircle2 size={9} color="#FFFFFF" strokeWidth={2.5} />,
        };
      case 'SCHEDULED':
        return {
          label: 'Scheduled',
          bg: colors.status.warningBg,
          text: colors.status.warning,
          icon: <Clock size={10} color={colors.status.warning} strokeWidth={2.5} />,
          overlayBg: 'rgba(217, 119, 6, 0.9)',
          overlayTextColor: '#FFFFFF',
          overlayIcon: <Clock size={9} color="#FFFFFF" strokeWidth={2.5} />,
        };
      case 'FAILED':
        return {
          label: 'Failed',
          bg: colors.status.errorBg,
          text: colors.status.error,
          icon: <AlertCircle size={10} color={colors.status.error} strokeWidth={2.5} />,
          overlayBg: 'rgba(220, 38, 38, 0.9)',
          overlayTextColor: '#FFFFFF',
          overlayIcon: <AlertCircle size={9} color="#FFFFFF" strokeWidth={2.5} />,
        };
      case 'PUBLISHING':
        return {
          label: 'Sending...',
          bg: colors.primary.subtle,
          text: colors.primary.DEFAULT,
          icon: <Send size={10} color={colors.primary.DEFAULT} strokeWidth={2.5} />,
          overlayBg: 'rgba(42, 171, 238, 0.9)',
          overlayTextColor: '#FFFFFF',
          overlayIcon: <Send size={9} color="#FFFFFF" strokeWidth={2.5} />,
        };
      default:
        return {
          label: 'Draft',
          bg: colors.background.highlight,
          text: colors.text.muted,
          icon: <FileText size={10} color={colors.text.muted} strokeWidth={2.5} />,
          overlayBg: 'rgba(255, 255, 255, 0.28)',
          overlayTextColor: '#FFFFFF',
          overlayIcon: <FileText size={9} color="#FFFFFF" strokeWidth={2.5} />,
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

  // Context Action Menu State & Anchoring
  const [menuVisible, setMenuVisible] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState<{
    x: number;
    y: number;
    width?: number;
    height?: number;
  } | null>(null);
  const mediaMoreButtonRef = useRef<View>(null);
  const textMoreButtonRef = useRef<View>(null);

  const openActionMenu = (
    buttonRef: React.RefObject<View | null>,
    e: any
  ) => {
    e.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const { pageX, pageY } = e?.nativeEvent || {};

    if (buttonRef.current && typeof buttonRef.current.measureInWindow === 'function') {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        if (width && height) {
          setAnchorPosition({ x, y, width, height });
        } else if (pageX !== undefined && pageY !== undefined) {
          setAnchorPosition({ x: pageX, y: pageY, width: 24, height: 24 });
        } else {
          setAnchorPosition(null);
        }
        setMenuVisible(true);
      });
    } else if (pageX !== undefined && pageY !== undefined) {
      setAnchorPosition({ x: pageX, y: pageY, width: 24, height: 24 });
      setMenuVisible(true);
    } else {
      setAnchorPosition(null);
      setMenuVisible(true);
    }
  };

  // Build Action Menu Sections (Matching Inspiration: "Status" and "Record actions")
  const menuSections: ActionMenuSection[] = [];

  // 1. Status Section
  const statusItems: ActionMenuItem[] = [];
  if (post.status === 'SCHEDULED') {
    statusItems.push({
      id: 'publish-now',
      label: 'Publish now',
      icon: <Zap size={16} color="#0D9488" strokeWidth={2} />,
      variant: 'primary',
      onPress: handlePublishNow,
    });
    statusItems.push({
      id: 'cancel-schedule',
      label: 'Cancel schedule',
      icon: <XCircle size={16} color="#E11D48" strokeWidth={2} />,
      variant: 'danger',
      onPress: handleCancelSchedule,
    });
  } else if (post.status === 'FAILED' && onPublishNow) {
    statusItems.push({
      id: 'retry-broadcast',
      label: 'Retry broadcast',
      icon: <RefreshCw size={16} color="#0D9488" strokeWidth={2} />,
      variant: 'primary',
      onPress: () => onPublishNow(post.id),
    });
  } else if (post.status === 'DRAFT' && onPublishNow) {
    statusItems.push({
      id: 'publish-draft',
      label: 'Publish now',
      icon: <Send size={16} color="#0D9488" strokeWidth={2} />,
      variant: 'primary',
      onPress: handlePublishNow,
    });
  }

  if (statusItems.length > 0) {
    menuSections.push({
      title: 'Status',
      items: statusItems,
    });
  }

  // 2. Record Actions Section (matches "Record actions" from design inspiration)
  const recordItems: ActionMenuItem[] = [
    {
      id: 'view-post',
      label: 'View',
      icon: <Eye size={16} color="#64748B" strokeWidth={2} />,
      onPress: () => onPress(post),
    },
  ];

  if (onEdit) {
    recordItems.push({
      id: 'edit-post',
      label: 'Edit',
      icon: <Edit3 size={16} color="#0D9488" strokeWidth={2} />,
      variant: 'primary',
      onPress: () => onEdit(post),
    });
  }

  if (onDelete) {
    recordItems.push({
      id: 'delete-post',
      label: 'Delete',
      icon: <Trash2 size={16} color="#E11D48" strokeWidth={2} />,
      variant: 'danger',
      onPress: handleDelete,
    });
  }

  menuSections.push({
    title: 'Record actions',
    items: recordItems,
  });

  // =========================================================================
  // Render: Full-Bleed Media Card (Image Takes Up the Whole Card)
  // =========================================================================
  if (hasImage && firstMedia?.media_url) {
    return (
      <Pressable
        onPress={() => onPress(post)}
        style={({ pressed }) => [styles.card, styles.mediaCard, style, pressed && styles.cardPressed]}
      >
        {/* 1. Full Bleed Background Image covering the entire card */}
        <Image
          source={{ uri: firstMedia.media_url }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* 2. Top-to-Bottom Gradient: Ensures icons and text are easily readable */}
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.55)', 'rgba(15, 23, 42, 0.05)', 'rgba(15, 23, 42, 0.92)']}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* 3. Top Floating Bar: Platform Avatar + Media Badges + 3-Dot Button */}
        <View style={styles.mediaTopBar}>
          <View style={styles.mediaTopLeft}>
            {/* Platform Badge */}
            <View
              style={[
                styles.platformBadge,
                isLinkedIn ? styles.linkedInBadge : styles.telegramBadge,
              ]}
            >
              {isLinkedIn ? (
                <LinkedInIcon size={12} color="#FFFFFF" />
              ) : (
                <TelegramIcon size={13} color="#FFFFFF" />
              )}
            </View>

            {/* Multiple Photos Count Badge */}
            {mediaAttachments.length > 1 && (
              <View style={styles.glassChip}>
                <ImageIcon size={10} color="#FFFFFF" />
                <Text style={styles.glassChipText}>+{mediaAttachments.length - 1}</Text>
              </View>
            )}

            {/* Pin Badge */}
            {post.pin_message && (
              <View style={[styles.glassChip, styles.pinChip]}>
                <Pin size={10} color="#FFD166" />
              </View>
            )}
          </View>

          {/* 3-Dot Context Action Button */}
          <TouchableOpacity
            ref={mediaMoreButtonRef}
            onPress={(e) => openActionMenu(mediaMoreButtonRef, e)}
            style={styles.mediaMoreButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Broadcast options"
          >
            <MoreVertical size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Center Space: Let the photo breathe */}
        <View style={styles.centerFlex} />

        {/* 4. Bottom Content Overlay (Flush inside bottom gradient) */}
        <View style={styles.mediaBottomContent}>
          {/* Destination Subtitle */}
          <Text style={styles.mediaDestination} numberOfLines={1}>
            {destinationLabel}
          </Text>

          {/* Title Snippet */}
          <Text style={styles.mediaTitle} numberOfLines={2}>
            {titleSnippet}
          </Text>

          {/* Bottom Row: Status Pill + Timestamp */}
          <View style={styles.mediaFooterRow}>
            {/* Status Pill */}
            <View style={[styles.mediaStatusPill, { backgroundColor: statusBadge.overlayBg }]}>
              {statusBadge.overlayIcon}
              <Text style={[styles.mediaStatusText, { color: statusBadge.overlayTextColor }]}>
                {statusBadge.label}
              </Text>
            </View>

            {/* Timestamp */}
            {post.scheduled_for && post.status === 'SCHEDULED' ? (
              <View style={styles.mediaTimestampWrap}>
                <Calendar size={10} color="#FFD166" />
                <Text style={[styles.mediaTimestampText, { color: '#FFD166' }]}>
                  {format(new Date(post.scheduled_for), 'MMM d, h:mm a')}
                </Text>
              </View>
            ) : post.published_at ? (
              <Text style={styles.mediaTimestampText}>
                {formatDistanceToNow(new Date(post.published_at), { addSuffix: false })}
              </Text>
            ) : (
              <Text style={styles.mediaTimestampText}>
                {format(new Date(post.created_at || Date.now()), 'MMM d')}
              </Text>
            )}
          </View>

          {/* Failure Alert Notice */}
          {post.error_summary && post.status === 'FAILED' && (
            <View style={styles.mediaErrorNotice}>
              <AlertCircle size={11} color="#FF6B6B" style={{ marginRight: 4 }} />
              <Text style={styles.mediaErrorText} numberOfLines={1}>
                {post.error_summary}
              </Text>
            </View>
          )}
        </View>

        {/* Custom Action Menu Dropdown */}
        <ActionMenuModal
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          sections={menuSections}
          anchorPosition={anchorPosition}
        />
      </Pressable>
    );
  }

  // =========================================================================
  // Render: Text-Only Card (Same Tall & Big Proportions for Visual Harmony)
  // =========================================================================
  return (
    <Pressable
      onPress={() => onPress(post)}
      style={({ pressed }) => [styles.card, styles.textCard, style, pressed && styles.cardPressed]}
    >
      {/* Top Header Row */}
      <View style={styles.textTopRow}>
        <View style={styles.textTopLeft}>
          <View
            style={[
              styles.platformBadge,
              isLinkedIn ? styles.linkedInBadge : styles.telegramBadge,
            ]}
          >
            {isLinkedIn ? (
              <LinkedInIcon size={12} color="#FFFFFF" />
            ) : (
              <TelegramIcon size={13} color="#FFFFFF" />
            )}
          </View>

          <View style={styles.destinationColumn}>
            <Text style={styles.textDestination} numberOfLines={1}>
              {destinationLabel}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          ref={textMoreButtonRef}
          onPress={(e) => openActionMenu(textMoreButtonRef, e)}
          style={styles.textMoreButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Broadcast options"
        >
          <MoreVertical size={16} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Main Body Preview */}
      <View style={styles.textBodyContainer}>
        <Text style={styles.textBody} numberOfLines={6}>
          {cleanText}
        </Text>
      </View>

      {/* Bottom Metadata Row */}
      <View style={styles.textFooterRow}>
        <View style={styles.textFooterLeft}>
          <View style={[styles.statusPill, { backgroundColor: statusBadge.bg }]}>
            {statusBadge.icon}
            <Text style={[styles.statusPillText, { color: statusBadge.text }]}>
              {statusBadge.label}
            </Text>
          </View>

          {post.pin_message && (
            <View style={styles.metaChip}>
              <Pin size={10} color={colors.primary.DEFAULT} />
              <Text style={[styles.metaChipText, { color: colors.primary.DEFAULT }]}>Pinned</Text>
            </View>
          )}
        </View>

        {/* Timestamp */}
        <View style={styles.timestampWrap}>
          {post.scheduled_for && post.status === 'SCHEDULED' ? (
            <View style={styles.scheduleRow}>
              <Calendar size={10} color={colors.status.warning} />
              <Text style={[styles.timestampText, { color: colors.status.warning }]}>
                {format(new Date(post.scheduled_for), 'MMM d')}
              </Text>
            </View>
          ) : post.published_at ? (
            <Text style={styles.timestampText}>
              {formatDistanceToNow(new Date(post.published_at), { addSuffix: false })}
            </Text>
          ) : (
            <Text style={styles.timestampText}>
              {format(new Date(post.created_at || Date.now()), 'MMM d')}
            </Text>
          )}
        </View>
      </View>

      {/* Failure Alert Notice */}
      {post.error_summary && post.status === 'FAILED' && (
        <View style={styles.textErrorNotice}>
          <AlertCircle size={11} color={colors.status.error} style={{ marginRight: 4 }} />
          <Text style={styles.textErrorNoticeText} numberOfLines={1}>
            {post.error_summary}
          </Text>
        </View>
      )}

      {/* Custom Action Menu Dropdown */}
      <ActionMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        sections={menuSections}
        anchorPosition={anchorPosition}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Base Card: Tall and Big (250dp height for rich poster presentation)
  card: {
    flex: 1,
    height: 250,
    borderRadius: borderRadius.lg + 2,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.95,
  },

  // Media Card (Image Takes Up the Whole Card)
  mediaCard: {
    backgroundColor: '#0F172A',
    position: 'relative',
    justifyContent: 'space-between',
  },
  mediaTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    zIndex: 2,
  },
  mediaTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  platformBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  telegramBadge: {
    backgroundColor: '#2AABEE',
  },
  linkedInBadge: {
    backgroundColor: '#0A66C2',
  },
  airplaneIcon: {
    marginLeft: -1,
  },
  glassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    gap: 3,
  },
  glassChipText: {
    ...typography.presets.caption,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  pinChip: {
    paddingHorizontal: 5,
  },
  mediaMoreButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerFlex: {
    flex: 1,
  },
  mediaBottomContent: {
    padding: 10,
    paddingBottom: 10,
    zIndex: 2,
    gap: 4,
  },
  mediaDestination: {
    ...typography.presets.caption,
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  mediaTitle: {
    ...typography.presets.body,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  mediaFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  mediaStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    gap: 3,
  },
  mediaStatusText: {
    ...typography.presets.caption,
    fontSize: 9.5,
    fontWeight: '700',
  },
  mediaTimestampWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  mediaTimestampText: {
    ...typography.presets.caption,
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '600',
  },
  mediaErrorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.35)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    marginTop: 2,
  },
  mediaErrorText: {
    ...typography.presets.caption,
    color: '#FFB4B4',
    fontSize: 10,
    flex: 1,
  },

  // Text-Only Card
  textCard: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 12,
    justifyContent: 'space-between',
  },
  textTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  destinationColumn: {
    flex: 1,
    minWidth: 0,
  },
  textDestination: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 10.5,
    fontWeight: '600',
  },
  textMoreButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.background.highlight,
    marginLeft: 4,
  },
  textBodyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 6,
  },
  textBody: {
    ...typography.presets.body,
    color: colors.text.primary,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '500',
  },
  textFooterRow: {
    flexDirection: 'column',
    gap: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  textFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: colors.background.highlight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    gap: 3,
  },
  metaChipText: {
    ...typography.presets.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  timestampWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timestampText: {
    ...typography.presets.caption,
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  textErrorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.errorBg,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    marginTop: 4,
  },
  textErrorNoticeText: {
    ...typography.presets.caption,
    color: colors.status.error,
    fontSize: 10,
    flex: 1,
  },
});
