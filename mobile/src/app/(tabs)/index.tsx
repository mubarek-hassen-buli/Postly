import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '../../store/useAuthStore';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { AnalyticsSection } from '../../components/analytics/AnalyticsSection';
import { NotificationCenterModal } from '../../components/notifications/NotificationCenterModal';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';

export default function DashboardScreen() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
        {/* 1. Hero Greeting & Avatar */}
        <DashboardHeader
          userName={user?.first_name || user?.username || 'Creator'}
          avatarUrl={user?.avatar_url}
          onOpenNotifications={() => setNotificationsVisible(true)}
        />

        {/* 2. Decoupled Analytics Section (KPI Cards + Visual Charts) */}
        <AnalyticsSection />
      </ScrollView>

      {/* Notification Center Modal */}
      <NotificationCenterModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: layout.tabBarClearance,
  },
});
