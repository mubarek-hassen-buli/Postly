import React, { useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '../../store/useAuthStore';
import { AnalyticsSection } from '../../components/analytics/AnalyticsSection';
import { ScreenHeaderBanner, CurvedSheet } from '../../components/common/ScreenHeaderBanner';
import { NotificationBellButton } from '../../components/notifications/NotificationBellButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';

export default function DashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const displayName = user?.first_name || user?.username || 'Creator';
  const userInitials = displayName
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'P';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
        useAuthStore.getState().checkAuthStatus(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Signature Header Banner with Geometric Rings & Frosted Controls */}
      <ScreenHeaderBanner
        compact={false}
        leftAction={
          <View style={styles.avatarBorderWrapper}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitialsText}>{userInitials}</Text>
              </View>
            )}
          </View>
        }
        title={
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingCaption}>Welcome Back</Text>
            <Text style={styles.greetingName} numberOfLines={1}>
              {displayName} 👋
            </Text>
          </View>
        }
        rightActions={
          <NotificationBellButton
            variant="frosted"
            onPress={() => router.push('/notifications')}
          />
        }
      />

      {/* 2. High Curved Sheet with Analytics Content */}
      <CurvedSheet>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary.DEFAULT}
              colors={[colors.primary.DEFAULT]}
            />
          }
        >
          <AnalyticsSection />
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
  avatarBorderWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarInitialsText: {
    ...typography.presets.subheadMedium,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  greetingContainer: {
    marginTop: 6,
  },
  greetingCaption: {
    ...typography.presets.subhead,
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
  },
  greetingName: {
    ...typography.presets.hero,
    fontSize: 26,
    lineHeight: 32,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: layout.tabBarClearance + 20,
  },
});
