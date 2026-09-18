import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  BarChart2,
  Check,
  Megaphone,
  ShieldCheck,
  Users,
} from 'lucide-react-native';
import { ChannelItem } from '../../services/channels/channelService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

export interface ChannelCardProps {
  channel: ChannelItem;
  onToggleSelect: (channelId: string) => void;
  onPressStats?: (channel: ChannelItem) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  onToggleSelect,
  onPressStats,
}) => {
  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onToggleSelect(channel.id);
  };

  const handleStats = () => {
    Haptics.selectionAsync().catch(() => {});
    onPressStats?.(channel);
  };

  const formatMembers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <View
      style={[
        styles.card,
        channel.is_selected_by_user && styles.selectedCard,
      ]}
    >
      {/* Selection Checkbox on Left */}
      <TouchableOpacity
        onPress={handleToggle}
        style={[
          styles.checkbox,
          channel.is_selected_by_user && styles.checkedBox,
        ]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityLabel={`Select ${channel.title}`}
        accessibilityRole="checkbox"
      >
        {channel.is_selected_by_user && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
      </TouchableOpacity>

      {/* Channel Info Center */}
      <Pressable onPress={handleStats} style={styles.centerInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {channel.title}
          </Text>
          {channel.is_creator && (
            <View style={styles.creatorBadge}>
              <Text style={styles.creatorText}>Owner</Text>
            </View>
          )}
        </View>

        <Text style={styles.username} numberOfLines={1}>
          {channel.username ? `@${channel.username}` : `ID: ${channel.telegram_channel_id}`}
        </Text>

        <View style={styles.metadataRow}>
          {/* Members count badge */}
          <View style={styles.metaBadge}>
            <Users size={12} color={colors.text.secondary} style={styles.metaIcon} />
            <Text style={styles.metaText}>{formatMembers(channel.member_count)} subs</Text>
          </View>

          {/* Posting capability pill */}
          <View
            style={[
              styles.permissionBadge,
              channel.can_post_messages ? styles.canPostBadge : styles.cannotPostBadge,
            ]}
          >
            {channel.can_post_messages ? (
              <>
                <ShieldCheck size={12} color={colors.status.success} style={styles.metaIcon} />
                <Text style={styles.canPostText}>Admin</Text>
              </>
            ) : (
              <>
                <Megaphone size={12} color={colors.text.muted} style={styles.metaIcon} />
                <Text style={styles.cannotPostText}>Read-Only</Text>
              </>
            )}
          </View>
        </View>
      </Pressable>

      {/* Stats Button on Right */}
      {onPressStats && (
        <TouchableOpacity
          onPress={handleStats}
          style={styles.statsButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel={`View stats for ${channel.title}`}
        >
          <BarChart2 size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    ...shadows.subtle,
  },
  selectedCard: {
    borderColor: 'rgba(42, 171, 238, 0.45)',
    backgroundColor: colors.primary.subtle,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.strong,
    backgroundColor: colors.background.input,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkedBox: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  centerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
    flexShrink: 1,
  },
  creatorBadge: {
    backgroundColor: colors.primary.subtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  creatorText: {
    ...typography.presets.caption,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
    fontSize: 10,
  },
  username: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  permissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  canPostBadge: {
    backgroundColor: colors.status.successBg,
  },
  cannotPostBadge: {
    backgroundColor: colors.background.elevated,
  },
  canPostText: {
    ...typography.presets.caption,
    color: colors.status.success,
    fontSize: 11,
    fontWeight: '500',
  },
  cannotPostText: {
    ...typography.presets.caption,
    color: colors.text.muted,
    fontSize: 11,
  },
  statsButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});
