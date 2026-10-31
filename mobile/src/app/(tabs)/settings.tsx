import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  Link2,
  LogOut,
  Unlink,
  User as UserIcon,
} from 'lucide-react-native';
import { TelegramIcon, LinkedInIcon } from '../../components/common/BrandIcons';
import * as Haptics from 'expo-haptics';

import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/auth/authService';
import {
  useConnectLinkedIn,
  useDisconnectLinkedIn,
  useLinkedInStatus,
} from '../../hooks/useLinkedIn';
import { Card } from '../../components/ui/Card';
import { ScreenHeaderBanner, CurvedSheet } from '../../components/common/ScreenHeaderBanner';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, layout, spacing } from '../../theme/spacing';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, checkAuthStatus } = useAuthStore();
  const [disconnecting, setDisconnecting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Sync fresh profile on mount to guarantee up-to-date avatar_url
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // LinkedIn Integration Hooks
  const { data: linkedinData, isLoading: linkedinLoading } = useLinkedInStatus();
  const connectLinkedInMutation = useConnectLinkedIn();
  const disconnectLinkedInMutation = useDisconnectLinkedIn();

  const handleConnectLinkedIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const res = await connectLinkedInMutation.mutateAsync();
      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        Alert.alert('LinkedIn Connected', res.message || 'Your LinkedIn account has been connected.');
      } else if (res.message && !res.message.includes('cancelled')) {
        Alert.alert('Connection Incomplete', res.message);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to connect LinkedIn.');
    }
  };

  const handleDisconnectLinkedIn = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert(
      'Disconnect LinkedIn',
      'Are you sure you want to disconnect your LinkedIn account? You will no longer be able to publish posts to your LinkedIn feed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await disconnectLinkedInMutation.mutateAsync();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to disconnect LinkedIn.');
            }
          },
        },
      ]
    );
  };

  const handleDisconnect = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert(
      'Disconnect Telegram',
      'Are you sure you want to disconnect your Telegram MTProto session? You will need to log in again with your phone number to publish posts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setDisconnecting(true);
            try {
              await authService.disconnectTelegram();
              await logout();
              router.replace('/(auth)/login');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to disconnect session.');
            } finally {
              setDisconnecting(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Postly?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScreenHeaderBanner
        title="Settings"
        subtitle="Account & Session Preferences"
      >
        {/* User Profile Hero inside Header */}
        <View style={styles.bannerProfileHero}>
          <View style={styles.bannerAvatarCircle}>
            {user?.avatar_url && !avatarError ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={styles.bannerAvatarImage}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <UserIcon size={26} color="#FFFFFF" />
            )}
          </View>
          <View style={styles.bannerProfileText}>
            <Text style={styles.bannerProfileName}>
              {user?.first_name
                ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`
                : user?.username || 'Telegram User'}
            </Text>
            <Text style={styles.bannerProfilePhone}>{user?.phone_number}</Text>
            {user?.telegram_session?.username && (
              <Text style={styles.bannerProfileHandle}>
                @{user.telegram_session.username}
              </Text>
            )}
          </View>
        </View>
      </ScreenHeaderBanner>

      <CurvedSheet>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

        {/* Telegram Session Section */}
        <Text style={styles.sectionTitle}>Telegram MTProto Connection</Text>
        <Card style={styles.settingsGroup}>
          <View style={styles.sessionRow}>
            <View style={styles.telegramPlatformBadge}>
              <TelegramIcon size={20} color="#FFFFFF" />
            </View>
            <View style={styles.sessionDetails}>
              <Text style={styles.sessionTitle}>Active Telegram Session</Text>
              <Text style={styles.sessionStatus}>
                Status: {user?.telegram_session?.auth_state || 'AUTHENTICATED'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleDisconnect}
            disabled={disconnecting}
            style={styles.actionRow}
          >
            <Unlink size={18} color={colors.status.warning} style={styles.actionIcon} />
            <Text style={[styles.actionText, { color: colors.status.warning }]}>
              {disconnecting ? 'Disconnecting...' : 'Disconnect Telegram Session'}
            </Text>
            <ChevronRight size={16} color={colors.text.muted} />
          </TouchableOpacity>
        </Card>

        {/* LinkedIn Integration Section */}
        <Text style={styles.sectionTitle}>LinkedIn Integration</Text>
        <Card style={styles.settingsGroup}>
          <View style={styles.sessionRow}>
            <View style={styles.platformBadge}>
              <LinkedInIcon size={20} color="#FFFFFF" />
            </View>
            <View style={styles.sessionDetails}>
              <Text style={styles.sessionTitle}>
                {linkedinData?.is_connected
                  ? linkedinData.account?.name || 'LinkedIn Account'
                  : 'LinkedIn Personal Feed'}
              </Text>
              <Text
                style={[
                  styles.sessionStatus,
                  {
                    color: linkedinData?.is_connected
                      ? colors.status.success
                      : colors.text.muted,
                  },
                ]}
              >
                {linkedinData?.is_connected
                  ? `Connected • ${linkedinData.account?.email || 'Ready to post'}`
                  : 'Not connected'}
              </Text>
            </View>
          </View>

          {linkedinData?.is_connected ? (
            <TouchableOpacity
              onPress={handleDisconnectLinkedIn}
              disabled={disconnectLinkedInMutation.isPending}
              style={styles.actionRow}
            >
              <Unlink size={18} color={colors.status.warning} style={styles.actionIcon} />
              <Text style={[styles.actionText, { color: colors.status.warning }]}>
                {disconnectLinkedInMutation.isPending
                  ? 'Disconnecting...'
                  : 'Disconnect LinkedIn Account'}
              </Text>
              <ChevronRight size={16} color={colors.text.muted} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleConnectLinkedIn}
              disabled={connectLinkedInMutation.isPending || linkedinLoading}
              style={styles.actionRow}
            >
              <Link2 size={18} color={colors.primary.DEFAULT} style={styles.actionIcon} />
              <Text style={[styles.actionText, { color: colors.primary.DEFAULT }]}>
                {connectLinkedInMutation.isPending ? 'Connecting...' : 'Connect LinkedIn Account'}
              </Text>
              <ChevronRight size={16} color={colors.text.muted} />
            </TouchableOpacity>
          )}
        </Card>

        {/* Account Actions */}
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <Card style={styles.settingsGroup}>
          <TouchableOpacity onPress={handleLogout} style={styles.actionRow}>
            <LogOut size={18} color={colors.status.error} style={styles.actionIcon} />
            <Text style={[styles.actionText, { color: colors.status.error }]}>
              Sign Out of Postly
            </Text>
            <ChevronRight size={16} color={colors.text.muted} />
          </TouchableOpacity>
        </Card>

        {/* App Version Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Postly Mobile v1.0.0 (Production)</Text>
          <Text style={styles.versionSubtext}>Encrypted Telegram MTProto Bridge</Text>
        </View>
      </ScrollView>
    </CurvedSheet>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0077B6',
  },
  bannerProfileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  bannerAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bannerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  bannerProfileText: {
    flex: 1,
  },
  bannerProfileName: {
    ...typography.presets.title2,
    color: '#FFFFFF',
    fontSize: 18,
  },
  bannerProfilePhone: {
    ...typography.presets.subhead,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    marginTop: 1,
  },
  bannerProfileHandle: {
    ...typography.presets.caption,
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 24,
    paddingBottom: layout.tabBarClearance + 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.subtle,
    borderWidth: 1.5,
    borderColor: colors.primary.subtleBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...typography.presets.title3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  userPhone: {
    ...typography.presets.subhead,
    color: colors.text.secondary,
    marginTop: 2,
  },
  userHandle: {
    ...typography.presets.caption,
    color: colors.primary.DEFAULT,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.presets.subheadMedium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
    marginTop: spacing.md,
  },
  settingsGroup: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  platformBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0A66C2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  telegramPlatformBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2AABEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sessionIcon: {
    marginRight: spacing.md,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionTitle: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  sessionStatus: {
    ...typography.presets.caption,
    color: colors.status.success,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  actionIcon: {
    marginRight: spacing.md,
  },
  actionText: {
    ...typography.presets.body,
    flex: 1,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  versionText: {
    ...typography.presets.caption,
    color: colors.text.muted,
  },
  versionSubtext: {
    ...typography.presets.caption,
    color: colors.text.disabled,
    fontSize: 10,
    marginTop: 2,
  },
});
