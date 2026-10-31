import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Calendar,
  Eye,
  Info,
  Pin,
  Send,
  Sparkles,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';

import { useChannels } from '../hooks/useChannels';
import { ChannelItem } from '../services/channels/channelService';
import { useCreatePost, usePost, useUpdatePost } from '../hooks/usePosts';
import { useLinkedInStatus, usePublishLinkedInPost } from '../hooks/useLinkedIn';
import { FormattingToolbar, FormattingMode } from '../components/composer/FormattingToolbar';
import { ChannelSelectorPills } from '../components/composer/ChannelSelectorPills';
import { MediaPickerSection, LocalMediaAttachment } from '../components/composer/MediaPickerSection';
import { SchedulePickerModal } from '../components/composer/SchedulePickerModal';
import { PostPreviewModal } from '../components/composer/PostPreviewModal';
import { LinkedInIcon } from '../components/common/BrandIcons';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, spacing } from '../theme/spacing';

const MAX_TEXT_LENGTH = 4096;
const MAX_CAPTION_LENGTH = 1024;

export default function ComposeModalScreen() {
  const router = useRouter();
  const { editPostId } = useLocalSearchParams<{ editPostId?: string }>();
  const isEditing = Boolean(editPostId);

  // Form State
  const [content, setContent] = useState('');
  const [formattingMode, setFormattingMode] = useState<FormattingMode>('HTML');
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [pinMessage, setPinMessage] = useState(false);
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<LocalMediaAttachment[]>([]);
  const [postToLinkedIn, setPostToLinkedIn] = useState(false);

  // Modals
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  // Queries & Mutations
  const { data: channelsData } = useChannels({ can_post_only: true });
  const channels: ChannelItem[] = Array.isArray(channelsData?.results)
    ? channelsData.results
    : Array.isArray(channelsData)
    ? (channelsData as ChannelItem[])
    : [];

  const { data: editingPost } = usePost(editPostId || null);
  const isEditingPublished = isEditing && editingPost?.status === 'PUBLISHED';
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  const { data: linkedinData } = useLinkedInStatus();
  const publishLinkedInMutation = usePublishLinkedInPost();
  const isSubmitting =
    createPostMutation.isPending ||
    publishLinkedInMutation.isPending ||
    updatePostMutation.isPending;

  const hasInitializedChannels = useRef(false);
  const hasPopulatedEditPost = useRef(false);

  // Pre-populate fields when editing an existing post
  useEffect(() => {
    if (editingPost && !hasPopulatedEditPost.current) {
      hasPopulatedEditPost.current = true;
      setContent(editingPost.text_content || editingPost.content || '');
      if (editingPost.formatting_mode) {
        setFormattingMode(editingPost.formatting_mode as FormattingMode);
      }
      if (editingPost.targets && editingPost.targets.length > 0) {
        const targetChannelIds = editingPost.targets
          .map((t) => t.channel_id || t.channel?.id)
          .filter((id): id is string => Boolean(id));
        if (targetChannelIds.length > 0) {
          setSelectedChannelIds(targetChannelIds);
        }
      }
      setPinMessage(Boolean(editingPost.pin_message));
      setScheduledFor(editingPost.scheduled_for || null);
      if (editingPost.post_to_linkedin !== undefined) {
        setPostToLinkedIn(Boolean(editingPost.post_to_linkedin));
      }
      if (editingPost.media_attachments && editingPost.media_attachments.length > 0) {
        setAttachments(
          editingPost.media_attachments.map((m) => ({
            localUri: m.media_url,
            media_url: m.media_url,
            media_type: m.media_type || 'IMAGE',
            file_size: m.file_size || 0,
            isUploading: false,
            progress: 1,
          }))
        );
      }
    }
  }, [editingPost]);

  // Pre-select channels that have `is_selected_by_user === true` once on initial load (only for new posts)
  useEffect(() => {
    if (!isEditing && !hasInitializedChannels.current && channels.length > 0) {
      hasInitializedChannels.current = true;
      const defaultSelected = channels
        .filter((ch) => ch.is_selected_by_user)
        .map((ch) => ch.id);
      setSelectedChannelIds(defaultSelected.length > 0 ? defaultSelected : [channels[0].id]);
    }
  }, [channels, isEditing]);

  const maxChars = postToLinkedIn ? 3000 : (attachments.length > 0 ? MAX_CAPTION_LENGTH : MAX_TEXT_LENGTH);
  const isOverLimit = content.length > maxChars;

  const handleToggleChannel = (id: string) => {
    setSelectedChannelIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleInsertTag = (startTag: string, endTag: string) => {
    setContent((prev) => `${prev}${startTag}${endTag}`);
  };

  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) {
      Alert.alert('Empty Post', 'Please write some text or attach media to publish.');
      return;
    }

    if (selectedChannelIds.length === 0 && !postToLinkedIn) {
      Alert.alert('No Destination Selected', 'Please select at least one Telegram channel or enable LinkedIn posting.');
      return;
    }

    if (isOverLimit) {
      Alert.alert('Character Limit Exceeded', `Your text exceeds the ${maxChars} character limit.`);
      return;
    }

    // Ensure no media is still uploading
    if (attachments.some((a) => a.isUploading)) {
      Alert.alert('Uploading in Progress', 'Please wait for your photos/videos to finish uploading.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    try {
      const mediaPayload = attachments
        .filter((a) => a.media_url)
        .map((a, index) => ({
          media_url: a.media_url!,
          media_type: a.media_type,
          file_size: a.file_size,
          order: index,
        }));

      // Edit Mode
      if (isEditing && editPostId) {
        await updatePostMutation.mutateAsync({
          id: editPostId,
          payload: {
            text_content: content.trim(),
            content: content.trim(),
            target_channel_ids: selectedChannelIds,
            channel_ids: selectedChannelIds,
            post_to_linkedin: postToLinkedIn,
            formatting_mode: formattingMode,
            pin_message: pinMessage,
            scheduled_for: scheduledFor,
            media_attachments: mediaPayload,
          },
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        router.back();
        return;
      }

      // Create Mode (Unified multi-platform dispatch & scheduling)
      await createPostMutation.mutateAsync({
        text_content: content.trim(),
        content: content.trim(),
        target_channel_ids: selectedChannelIds,
        channel_ids: selectedChannelIds,
        post_to_linkedin: postToLinkedIn,
        formatting_mode: formattingMode,
        pin_message: pinMessage,
        scheduled_for: scheduledFor,
        publish_now: !scheduledFor,
        media_attachments: mediaPayload,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.back();
    } catch (error: any) {
      Alert.alert('Publishing Error', error.message || 'Failed to submit post.');
    }
  };

  const selectedChannelNames = channels
    .filter((ch) => selectedChannelIds.includes(ch.id))
    .map((ch) => ch.title);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Action Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
          accessibilityLabel="Close composer"
        >
          <X size={22} color={colors.text.secondary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Broadcast' : 'New Broadcast'}
        </Text>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            onPress={() => setPreviewModalVisible(true)}
            style={styles.previewBtn}
            accessibilityLabel="Preview post"
          >
            <Eye size={18} color={colors.primary.DEFAULT} />
          </TouchableOpacity>

          <Button
            title={
              isEditing
                ? isEditingPublished
                  ? 'Update Telegram'
                  : 'Save Changes'
                : scheduledFor
                ? 'Schedule'
                : 'Publish'
            }
            onPress={handleSubmit}
            loading={isSubmitting}
            size="sm"
            leftIcon={
              scheduledFor && !isEditing ? (
                <Calendar size={14} color="#FFFFFF" />
              ) : (
                <Send size={14} color="#FFFFFF" />
              )
            }
          />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Published Edit Notice */}
          {isEditingPublished && (
            <View style={styles.publishedEditBanner}>
              <Info size={16} color={colors.primary.DEFAULT} style={styles.bannerIcon} />
              <Text style={styles.publishedEditText}>
                Editing published broadcast. Saving will immediately update the messages in your Telegram channels.
              </Text>
            </View>
          )}

          {/* Target Channel Selector */}
          <ChannelSelectorPills
            channels={channels}
            selectedChannelIds={selectedChannelIds}
            onToggleChannel={handleToggleChannel}
            onSelectAll={() => setSelectedChannelIds(channels.map((ch) => ch.id))}
            onClearAll={() => setSelectedChannelIds([])}
          />

          {/* LinkedIn Cross-Posting Destination */}
          {linkedinData?.is_connected && (
            <Card style={styles.linkedinTargetCard}>
              <View style={styles.linkedinTargetLeft}>
                <View style={styles.linkedinBadgeIcon}>
                  <LinkedInIcon size={18} color="#FFFFFF" />
                </View>
                <View style={styles.linkedinTargetText}>
                  <Text style={styles.linkedinTargetTitle}>Post to LinkedIn</Text>
                  <Text style={styles.linkedinTargetSubtitle}>
                    {linkedinData.account?.name || 'Personal Feed'}
                  </Text>
                </View>
              </View>
              <Switch
                value={postToLinkedIn}
                onValueChange={(val) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setPostToLinkedIn(val);
                }}
                trackColor={{ false: colors.border.medium, true: '#0A66C2' }}
                thumbColor="#FFFFFF"
              />
            </Card>
          )}

          {/* Formatting Toolbar */}
          <FormattingToolbar
            mode={formattingMode}
            onModeChange={setFormattingMode}
            onInsertTag={handleInsertTag}
          />

          {/* Text Area */}
          <Card style={styles.textCard}>
            <TextInput
              placeholder="What would you like to broadcast to your Telegram channels?"
              placeholderTextColor={colors.text.muted}
              selectionColor={colors.primary.DEFAULT}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              style={styles.textArea}
            />

            {/* Character Counter */}
            <View style={styles.counterRow}>
              <Text style={[styles.counterText, isOverLimit && styles.counterOverLimit]}>
                {content.length} / {maxChars}
              </Text>
            </View>
          </Card>

          {/* Media Attachments Section */}
          <MediaPickerSection
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            maxCount={10}
          />

          {/* Broadcast Options Group */}
          <Text style={styles.sectionHeader}>Publishing Options</Text>
          <Card style={styles.optionsCard}>
            {/* Schedule Option */}
            <TouchableOpacity
              onPress={() => setScheduleModalVisible(true)}
              style={styles.optionRow}
            >
              <View style={styles.optionLeft}>
                <Calendar size={18} color={scheduledFor ? colors.primary.DEFAULT : colors.text.muted} />
                <View>
                  <Text style={styles.optionTitle}>Publishing Time</Text>
                  <Text style={styles.optionSubtitle}>
                    {scheduledFor
                      ? `Scheduled: ${format(new Date(scheduledFor), 'MMM d, yyyy @ h:mm a')}`
                      : 'Immediate Broadcast'}
                  </Text>
                </View>
              </View>
              <Text style={styles.optionActionText}>
                {scheduledFor ? 'Change' : 'Schedule'}
              </Text>
            </TouchableOpacity>

            {/* Pin Message Option */}
            <View style={[styles.optionRow, styles.lastOptionRow]}>
              <View style={styles.optionLeft}>
                <Pin size={18} color={pinMessage ? colors.primary.DEFAULT : colors.text.muted} />
                <View>
                  <Text style={styles.optionTitle}>Pin Message</Text>
                  <Text style={styles.optionSubtitle}>
                    Automatically pin at the top of target channels
                  </Text>
                </View>
              </View>
              <Switch
                value={pinMessage}
                onValueChange={(val) => {
                  Haptics.selectionAsync().catch(() => {});
                  setPinMessage(val);
                }}
                trackColor={{ false: colors.background.input, true: colors.primary.DEFAULT }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Schedule Picker Modal */}
      <SchedulePickerModal
        visible={scheduleModalVisible}
        onClose={() => setScheduleModalVisible(false)}
        scheduledFor={scheduledFor}
        onSelectSchedule={setScheduledFor}
      />

      {/* Telegram Live Preview Modal */}
      <PostPreviewModal
        visible={previewModalVisible}
        onClose={() => setPreviewModalVisible(false)}
        content={content}
        formattingMode={formattingMode}
        pinMessage={pinMessage}
        attachments={attachments}
        channelNames={selectedChannelNames}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.presets.title3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  previewBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.massive,
  },
  textCard: {
    minHeight: 180,
    backgroundColor: colors.background.input,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  textArea: {
    ...typography.presets.body,
    color: colors.text.primary,
    flex: 1,
    minHeight: 140,
  },
  counterRow: {
    alignItems: 'flex-end',
    marginTop: spacing.xs,
  },
  counterText: {
    ...typography.presets.caption,
    color: colors.text.muted,
  },
  counterOverLimit: {
    color: colors.status.error,
    fontWeight: '700',
  },
  sectionHeader: {
    ...typography.presets.subheadMedium,
    color: colors.text.secondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  optionsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  lastOptionRow: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  optionTitle: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  optionSubtitle: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  optionActionText: {
    ...typography.presets.subheadMedium,
    color: colors.primary.DEFAULT,
  },
  linkedinTargetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  linkedinTargetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkedinBadgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0A66C2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  linkedinTargetText: {
    flex: 1,
  },
  linkedinTargetTitle: {
    ...typography.presets.subheadMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  linkedinTargetSubtitle: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    marginTop: 1,
  },
  publishedEditBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.subtle,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(42, 171, 238, 0.25)',
  },
  bannerIcon: {
    marginRight: spacing.sm,
  },
  publishedEditText: {
    ...typography.presets.caption,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
});
