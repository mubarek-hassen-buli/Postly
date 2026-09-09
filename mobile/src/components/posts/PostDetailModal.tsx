import React from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Pin,
  Send,
  Trash2,
  X,
  XCircle,
  Zap,
} from 'lucide-react-native';
import { PostItem } from '../../services/posts/postService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

export interface PostDetailModalProps {
  post: PostItem | null;
  visible: boolean;
  onClose: () => void;
  onPublishNow?: (postId: string) => void;
  onCancelSchedule?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  visible,
  onClose,
  onPublishNow,
  onCancelSchedule,
  onDelete,
}) => {
  if (!post) return null;

  const handleDelete = () => {
    if (!onDelete) return;
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
          onPress: () => {
            onClose();
            onDelete(post.id);
          },
        },
      ]
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
              <Text style={styles.title}>Post Details</Text>
              <Text style={styles.subtitle}>
                Created on {format(new Date(post.created_at), 'MMMM d, yyyy @ h:mm a')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            {/* Status & Options Row */}
            <View style={styles.metaBadgeRow}>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{post.status}</Text>
              </View>

              {post.pin_message && (
                <View style={styles.pinPill}>
                  <Pin size={12} color={colors.primary.DEFAULT} />
                  <Text style={styles.pinText}>Pinned Message</Text>
                </View>
              )}

              <View style={styles.formatPill}>
                <Text style={styles.formatText}>{post.formatting_mode} Mode</Text>
              </View>
            </View>

            {/* Post Content */}
            <Card style={styles.contentCard}>
              <Text style={styles.contentText}>{post.content || post.text_content || '(No text content)'}</Text>
            </Card>

            {/* Media Gallery */}
            {(post.media_attachments || []).length > 0 && (
              <View style={styles.mediaSection}>
                <Text style={styles.sectionHeader}>
                  Attached Media ({(post.media_attachments || []).length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
                  {(post.media_attachments || []).map((item, index) => (
                    <Image
                      key={item.id || index}
                      source={{ uri: item.media_url }}
                      style={styles.galleryImage}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Target Channels Delivery Breakdown */}
            {(post.targets || []).length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Target Channels & Dispatch States</Text>
                <Card style={styles.targetsCard}>
                  {(post.targets || []).map((target, idx) => {
                    const isSuccess = target.status === 'SUCCESS';
                    const isFailed = target.status === 'FAILED';
                    const channelTitle = target.channel?.title || 'Telegram Channel';
                    return (
                      <View
                        key={target.id}
                        style={[
                          styles.targetRow,
                          idx === (post.targets || []).length - 1 && styles.lastTargetRow,
                        ]}
                      >
                        <View style={styles.targetIcon}>
                          {isSuccess ? (
                            <CheckCircle size={18} color={colors.status.success} />
                          ) : isFailed ? (
                            <XCircle size={18} color={colors.status.error} />
                          ) : (
                            <Clock size={18} color={colors.status.warning} />
                          )}
                        </View>

                        <View style={styles.targetInfo}>
                          <Text style={styles.targetChannelTitle}>{channelTitle}</Text>
                          {target.telegram_message_id && (
                            <Text style={styles.targetMsgId}>
                              Telegram Message ID: #{target.telegram_message_id}
                            </Text>
                          )}
                          {target.error_message && (
                            <Text style={styles.targetErrorText}>{target.error_message}</Text>
                          )}
                          {target.sent_at && (
                            <Text style={styles.targetSentTime}>
                              Dispatched: {format(new Date(target.sent_at), 'MMM d, h:mm:ss a')}
                            </Text>
                          )}
                        </View>

                        <View
                          style={[
                            styles.targetStatusBadge,
                            isSuccess && styles.targetSuccessBadge,
                            isFailed && styles.targetFailedBadge,
                          ]}
                        >
                          <Text
                            style={[
                              styles.targetStatusText,
                              isSuccess && { color: colors.status.success },
                              isFailed && { color: colors.status.error },
                            ]}
                          >
                            {target.status}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </Card>
              </>
            )}

            {/* Scheduled Information */}
            {post.scheduled_for && (
              <Card style={styles.scheduleCard}>
                <Calendar size={18} color={colors.status.warning} style={styles.scheduleIcon} />
                <View>
                  <Text style={styles.scheduleTitle}>Scheduled Broadcast ETA</Text>
                  <Text style={styles.scheduleTime}>
                    {format(new Date(post.scheduled_for), 'EEEE, MMMM d, yyyy @ h:mm a')}
                  </Text>
                </View>
              </Card>
            )}
          </ScrollView>

          {/* Action Buttons Footer */}
          <View style={styles.footerActions}>
            {post.status === 'SCHEDULED' && onPublishNow && (
              <Button
                title="Publish Now"
                variant="primary"
                onPress={() => {
                  onClose();
                  onPublishNow(post.id);
                }}
                leftIcon={<Zap size={16} color="#FFFFFF" />}
                style={styles.actionButton}
              />
            )}

            {post.status === 'SCHEDULED' && onCancelSchedule && (
              <Button
                title="Cancel Schedule"
                variant="outline"
                onPress={() => {
                  onClose();
                  onCancelSchedule(post.id);
                }}
                leftIcon={<Clock size={16} color={colors.status.warning} />}
                style={styles.actionButton}
              />
            )}

            {onDelete && (
              <Button
                title="Delete"
                variant="ghost"
                onPress={handleDelete}
                leftIcon={<Trash2 size={16} color={colors.status.error} />}
                textStyle={{ color: colors.status.error }}
                style={styles.deleteButton}
              />
            )}
          </View>
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
    padding: spacing.xl,
    paddingBottom: spacing.massive,
    maxHeight: '90%',
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
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusPill: {
    backgroundColor: colors.primary.subtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  statusText: {
    ...typography.presets.caption,
    color: colors.primary.DEFAULT,
    fontWeight: '700',
  },
  pinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  pinText: {
    ...typography.presets.caption,
    color: colors.status.warning,
    fontWeight: '600',
  },
  formatPill: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  formatText: {
    ...typography.presets.caption,
    color: colors.text.muted,
  },
  contentCard: {
    backgroundColor: colors.background.input,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  contentText: {
    ...typography.presets.body,
    color: colors.text.primary,
    lineHeight: 22,
  },
  sectionHeader: {
    ...typography.presets.subheadMedium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  mediaSection: {
    marginBottom: spacing.md,
  },
  mediaScroll: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  targetsCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  lastTargetRow: {
    borderBottomWidth: 0,
  },
  targetIcon: {
    marginRight: spacing.md,
  },
  targetInfo: {
    flex: 1,
  },
  targetChannelTitle: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  targetMsgId: {
    ...typography.presets.caption,
    color: colors.primary.DEFAULT,
    marginTop: 2,
  },
  targetErrorText: {
    ...typography.presets.caption,
    color: colors.status.error,
    marginTop: 2,
  },
  targetSentTime: {
    ...typography.presets.caption,
    color: colors.text.muted,
    marginTop: 2,
    fontSize: 10,
  },
  targetStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.background.elevated,
  },
  targetSuccessBadge: {
    backgroundColor: colors.status.successBg,
  },
  targetFailedBadge: {
    backgroundColor: colors.status.errorBg,
  },
  targetStatusText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 10,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
    borderColor: 'rgba(255, 149, 0, 0.25)',
    padding: spacing.md,
  },
  scheduleIcon: {
    marginRight: spacing.md,
  },
  scheduleTitle: {
    ...typography.presets.caption,
    color: colors.status.warning,
    fontWeight: '600',
  },
  scheduleTime: {
    ...typography.presets.subhead,
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  footerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    paddingHorizontal: spacing.md,
  },
});
