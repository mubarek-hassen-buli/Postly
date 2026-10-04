import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CheckCircle,
  Clock,
  Pin,
  Send,
  Shield,
  Trash2,
  Users,
  X,
  XCircle,
} from 'lucide-react-native';
import { ChannelItem } from '../../services/channels/channelService';
import { useChannelStats } from '../../hooks/useChannels';
import { Card } from '../ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

export interface ChannelStatsModalProps {
  channel: ChannelItem | null;
  visible: boolean;
  onClose: () => void;
}

export const ChannelStatsModal: React.FC<ChannelStatsModalProps> = ({
  channel,
  visible,
  onClose,
}) => {
  const { data: stats, isLoading } = useChannelStats(channel?.id ?? null);

  if (!channel) return null;

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
              <Text style={styles.title} numberOfLines={1}>{channel.title}</Text>
              <Text style={styles.username}>
                {channel.username ? `@${channel.username}` : `ID: ${channel.telegram_channel_id}`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
              <Text style={styles.loadingText}>Fetching channel statistics...</Text>
            </View>
          ) : (
            <View style={styles.content}>
              {/* Metrics Grid */}
              <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                  <Users size={20} color={colors.primary.DEFAULT} style={styles.statIcon} />
                  <Text style={styles.statNumber}>
                    {((stats?.member_count ?? channel.member_count) ?? 0).toLocaleString()}
                  </Text>
                  <Text style={styles.statLabel}>Subscribers</Text>
                </Card>

                <Card style={styles.statCard}>
                  <Send size={20} color={colors.status.info} style={styles.statIcon} />
                  <Text style={styles.statNumber}>{stats?.total_posts_targeted ?? 0}</Text>
                  <Text style={styles.statLabel}>Total Posts</Text>
                </Card>
              </View>

              <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                  <CheckCircle size={20} color={colors.status.success} style={styles.statIcon} />
                  <Text style={styles.statNumber}>{stats?.successful_posts ?? 0}</Text>
                  <Text style={styles.statLabel}>Delivered</Text>
                </Card>

                <Card style={styles.statCard}>
                  <XCircle size={20} color={colors.status.error} style={styles.statIcon} />
                  <Text style={styles.statNumber}>{stats?.failed_posts ?? 0}</Text>
                  <Text style={styles.statLabel}>Failed</Text>
                </Card>
              </View>

              {/* Administrative Permissions */}
              <Text style={styles.sectionHeader}>Admin Permissions</Text>
              <Card style={styles.permissionsCard}>
                <View style={styles.permRow}>
                  <Shield size={16} color={channel.can_post_messages ? colors.status.success : colors.text.muted} />
                  <Text style={styles.permLabel}>Post Messages</Text>
                  <Text style={[styles.permStatus, channel.can_post_messages && styles.permGranted]}>
                    {channel.can_post_messages ? 'Allowed' : 'Denied'}
                  </Text>
                </View>

                <View style={styles.permRow}>
                  <Clock size={16} color={channel.can_edit_messages ? colors.status.success : colors.text.muted} />
                  <Text style={styles.permLabel}>Edit Messages</Text>
                  <Text style={[styles.permStatus, channel.can_edit_messages && styles.permGranted]}>
                    {channel.can_edit_messages ? 'Allowed' : 'Denied'}
                  </Text>
                </View>

                <View style={styles.permRow}>
                  <Trash2 size={16} color={channel.can_delete_messages ? colors.status.success : colors.text.muted} />
                  <Text style={styles.permLabel}>Delete Messages</Text>
                  <Text style={[styles.permStatus, channel.can_delete_messages && styles.permGranted]}>
                    {channel.can_delete_messages ? 'Allowed' : 'Denied'}
                  </Text>
                </View>

                <View style={[styles.permRow, styles.lastPermRow]}>
                  <Pin size={16} color={channel.can_pin_messages ? colors.status.success : colors.text.muted} />
                  <Text style={styles.permLabel}>Pin Messages</Text>
                  <Text style={[styles.permStatus, channel.can_pin_messages && styles.permGranted]}>
                    {channel.can_pin_messages ? 'Allowed' : 'Denied'}
                  </Text>
                </View>
              </Card>
            </View>
          )}
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
    borderTopWidth: 1.5,
    borderColor: colors.border.subtle,
    ...shadows.floating,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  titleArea: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    ...typography.presets.title2,
    color: colors.text.primary,
    fontWeight: '700',
  },
  username: {
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
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.presets.subhead,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  content: {
    gap: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  statIcon: {
    marginBottom: spacing.xs,
  },
  statNumber: {
    ...typography.presets.title2,
    color: colors.text.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  sectionHeader: {
    ...typography.presets.subheadMedium,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  permissionsCard: {
    padding: spacing.md,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  lastPermRow: {
    borderBottomWidth: 0,
  },
  permLabel: {
    ...typography.presets.subhead,
    color: colors.text.primary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  permStatus: {
    ...typography.presets.caption,
    color: colors.text.muted,
    fontWeight: '600',
  },
  permGranted: {
    color: colors.status.success,
  },
});
