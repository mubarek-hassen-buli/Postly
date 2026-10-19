import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Bell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useUnreadNotificationsCount } from '../../hooks/useNotifications';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface NotificationBellButtonProps {
  onPress: () => void;
  variant?: 'default' | 'frosted';
}

export const NotificationBellButton: React.FC<NotificationBellButtonProps> = ({
  onPress,
  variant = 'default',
}) => {
  const unreadCount = useUnreadNotificationsCount();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  const isFrosted = variant === 'frosted';

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        isFrosted && styles.frostedContainer,
      ]}
      accessibilityLabel={`Notifications (${unreadCount} unread)`}
      accessibilityRole="button"
    >
      <Bell
        size={20}
        color={isFrosted ? '#FFFFFF' : colors.text.secondary}
        strokeWidth={2.2}
      />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  frostedContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...typography.presets.caption,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
