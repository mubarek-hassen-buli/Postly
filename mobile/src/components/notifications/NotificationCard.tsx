import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';
import {
  AlertCircle,
  Bell,
  CheckCircle,
  ShieldAlert,
} from 'lucide-react-native';

import { NotificationLogItem } from '../../services/notifications/notificationService';
import { Card } from '../ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface NotificationCardProps {
  notification: NotificationLogItem;
  onPress: (notification: NotificationLogItem) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
}) => {
  const getEventMeta = () => {
    switch (notification.event_type) {
      case 'POST_PUBLISHED':
        return {
          icon: <CheckCircle size={18} color={colors.status.success} />,
          bg: colors.status.successBg,
        };
      case 'POST_FAILED':
        return {
          icon: <AlertCircle size={18} color={colors.status.error} />,
          bg: colors.status.errorBg,
        };
      case 'SESSION_REVOKED':
        return {
          icon: <ShieldAlert size={18} color={colors.status.warning} />,
          bg: colors.status.warningBg,
        };
      default:
        return {
          icon: <Bell size={18} color={colors.primary.DEFAULT} />,
          bg: colors.primary.subtle,
        };
    }
  };

  const meta = getEventMeta();

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    onPress(notification);
  };

  return (
    <Card
      style={[
        styles.card,
        !notification.is_read && styles.unreadCard,
      ]}
    >
      <Pressable onPress={handlePress} style={styles.contentRow}>
        <View style={[styles.iconWrapper, { backgroundColor: meta.bg }]}>
          {meta.icon}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !notification.is_read && styles.unreadTitle]} numberOfLines={1}>
              {notification.title}
            </Text>
            {!notification.is_read && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.bodyText} numberOfLines={2}>
            {notification.body}
          </Text>

          <Text style={styles.timeText}>
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </Text>
        </View>
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.xs + 2,
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
  },
  unreadCard: {
    borderColor: 'rgba(42, 171, 238, 0.4)',
    backgroundColor: colors.primary.subtle,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  infoContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    ...typography.presets.subheadMedium,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
    color: colors.text.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.DEFAULT,
    marginLeft: spacing.xs,
  },
  bodyText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  timeText: {
    ...typography.presets.caption,
    color: colors.text.muted,
    fontSize: 10,
  },
});
