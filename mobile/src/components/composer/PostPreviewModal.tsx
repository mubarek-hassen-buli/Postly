import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { format } from 'date-fns';
import { Eye, Pin, Send, X } from 'lucide-react-native';
import { LocalMediaAttachment } from './MediaPickerSection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

export interface PostPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  content: string;
  formattingMode: 'HTML' | 'MARKDOWN' | 'PLAIN';
  pinMessage: boolean;
  attachments: LocalMediaAttachment[];
  channelNames: string[];
}

export const PostPreviewModal: React.FC<PostPreviewModalProps> = ({
  visible,
  onClose,
  content,
  formattingMode,
  pinMessage,
  attachments,
  channelNames,
}) => {
  const formattedTime = format(new Date(), 'h:mm a');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>Telegram Channel Preview</Text>
              <Text style={styles.modalSubtitle}>
                {channelNames.length > 0
                  ? `Broadcasting to: ${channelNames.join(', ')}`
                  : 'No channels selected'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Telegram Channel Mockup Screen */}
          <View style={styles.telegramMockup}>
            {/* Telegram Channel Header */}
            <View style={styles.tgHeader}>
              <View style={styles.tgAvatar}>
                <Send size={16} color="#FFFFFF" />
              </View>
              <View style={styles.tgHeaderInfo}>
                <Text style={styles.tgChannelName} numberOfLines={1}>
                  {channelNames[0] || 'My Channel'}
                </Text>
                <Text style={styles.tgSubscribers}>12.4K subscribers</Text>
              </View>
            </View>

            {/* Pinned Message Bar */}
            {pinMessage && (
              <View style={styles.tgPinBar}>
                <Pin size={14} color={colors.primary.DEFAULT} style={styles.pinIcon} />
                <Text style={styles.tgPinText} numberOfLines={1}>
                  Pinned Message: {(content || '').replace(/<[^>]+>/g, '').slice(0, 40)}...
                </Text>
              </View>
            )}

            {/* Message Bubble Container */}
            <ScrollView style={styles.tgChatArea} contentContainerStyle={styles.chatScrollContent}>
              <View style={styles.tgMessageBubble}>
                {/* Media Attachment Grid */}
                {attachments.length > 0 && (
                  <View style={styles.mediaGrid}>
                    {attachments.map((item, index) => (
                      <Image
                        key={item.id || index}
                        source={{ uri: item.localUri }}
                        style={[
                          styles.mediaImage,
                          attachments.length === 1 && styles.singleMediaImage,
                        ]}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                )}

                {/* Text Content */}
                <Text style={styles.messageText}>
                  {content.trim() || 'Your message will appear here...'}
                </Text>

                {/* Message Meta Footer */}
                <View style={styles.metaFooter}>
                  <View style={styles.viewsRow}>
                    <Eye size={12} color={colors.text.muted} />
                    <Text style={styles.viewsCount}>1</Text>
                  </View>
                  <Text style={styles.messageTime}>{formattedTime}</Text>
                </View>
              </View>
            </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    ...shadows.floating,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.presets.title2,
    color: colors.text.primary,
    fontWeight: '700',
  },
  modalSubtitle: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    marginTop: 2,
    maxWidth: 260,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  telegramMockup: {
    borderRadius: borderRadius.lg,
    backgroundColor: '#0E1621',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    height: 400,
  },
  tgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#17212B',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tgAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  tgHeaderInfo: {
    flex: 1,
  },
  tgChannelName: {
    ...typography.presets.subheadMedium,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tgSubscribers: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 10,
  },
  tgPinBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C2733',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  pinIcon: {
    marginRight: 6,
  },
  tgPinText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  tgChatArea: {
    flex: 1,
    backgroundColor: '#0E1621',
  },
  chatScrollContent: {
    padding: spacing.md,
  },
  tgMessageBubble: {
    backgroundColor: '#182533',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    maxWidth: '92%',
    alignSelf: 'flex-start',
    ...shadows.subtle,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  mediaImage: {
    width: 110,
    height: 110,
    borderRadius: borderRadius.xs,
  },
  singleMediaImage: {
    width: 240,
    height: 160,
  },
  messageText: {
    ...typography.presets.body,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  metaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: 6,
  },
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewsCount: {
    ...typography.presets.caption,
    color: colors.text.muted,
    fontSize: 10,
  },
  messageTime: {
    ...typography.presets.caption,
    color: colors.text.muted,
    fontSize: 10,
  },
});
