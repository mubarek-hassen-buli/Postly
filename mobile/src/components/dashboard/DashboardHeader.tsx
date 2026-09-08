import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { NotificationBellButton } from '../notifications/NotificationBellButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface DashboardHeaderProps {
  userName?: string | null;
  avatarUrl?: string | null;
  onOpenNotifications: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  avatarUrl,
  onOpenNotifications,
}) => {
  const displayName = userName?.trim() || 'Creator';
  const userInitials = displayName
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'P';

  return (
    <View style={styles.container}>
      {/* User Greeting & Profile */}
      <View style={styles.leftColumn}>
        <Text style={styles.greetingCaption}>Hello</Text>
        <View style={styles.nameRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.wavingEmoji}>👋</Text>
        </View>
      </View>

      {/* Right Actions: Notification Bell, Avatar */}
      <View style={styles.rightActions}>
        <NotificationBellButton onPress={onOpenNotifications} />

        {/* User Avatar Circle */}
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{userInitials}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  leftColumn: {
    flex: 1,
    marginRight: spacing.md,
  },
  greetingCaption: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  userName: {
    ...typography.presets.title2,
    color: colors.text.primary,
    fontWeight: '800',
    letterSpacing: -0.4,
    maxWidth: '85%',
  },
  wavingEmoji: {
    fontSize: 18,
    marginLeft: 6,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: colors.primary.subtleBorder,
    overflow: 'hidden',
    backgroundColor: colors.background.surface,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...typography.presets.caption,
    color: colors.primary.light,
    fontWeight: '800',
    fontSize: 14,
  },
});
