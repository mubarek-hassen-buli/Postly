import React, { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { RefreshCw, Radio } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useChannels, useSyncChannels, useToggleChannelSelection } from '../../hooks/useChannels';
import { ChannelItem } from '../../services/channels/channelService';
import { ChannelCard } from '../../components/channels/ChannelCard';
import { ChannelFilterBar, ChannelFilterMode } from '../../components/channels/ChannelFilterBar';
import { NotificationBellButton } from '../../components/notifications/NotificationBellButton';
import { ScreenHeaderBanner, CurvedSheet } from '../../components/common/ScreenHeaderBanner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, layout, spacing } from '../../theme/spacing';

export default function ChannelsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<ChannelFilterMode>('ALL');

  // Queries & Mutations
  const {
    data: channelsData,
    isLoading,
    isRefetching,
    refetch,
  } = useChannels({
    selected_only: filterMode === 'SELECTED' ? true : undefined,
    can_post_only: filterMode === 'CAN_POST' ? true : undefined,
    search: searchQuery.trim() || undefined,
  });

  const syncMutation = useSyncChannels();
  const toggleMutation = useToggleChannelSelection();

  const channels: ChannelItem[] = Array.isArray(channelsData?.results)
    ? channelsData.results
    : Array.isArray(channelsData)
    ? (channelsData as ChannelItem[])
    : [];

  const totalCount = channelsData?.count ?? channels.length;
  const selectedCount = useMemo(() => {
    return channels.filter((ch) => ch.is_selected_by_user).length;
  }, [channels]);

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      await syncMutation.mutateAsync();
    } catch (error) {
      console.warn('Channel sync error:', error);
    }
  };

  const handleToggleSelect = (channelId: string) => {
    toggleMutation.mutate(channelId);
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading Telegram channels...</Text>
        </View>
      );
    }

    if (searchQuery || filterMode !== 'ALL') {
      return (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No matching channels</Text>
          <Text style={styles.emptySubtitle}>
            No channels found for your current filter or search criteria.
          </Text>
          <Button
            title="Reset Filters"
            variant="outline"
            size="sm"
            onPress={() => {
              setSearchQuery('');
              setFilterMode('ALL');
            }}
            style={styles.emptyButton}
          />
        </Card>
      );
    }

    return (
      <Card style={styles.emptyCard}>
        <View style={styles.emptyIconContainer}>
          <Radio size={36} color={colors.primary.DEFAULT} />
        </View>
        <Text style={styles.emptyTitle}>No channels discovered yet</Text>
        <Text style={styles.emptySubtitle}>
          Make sure your Telegram account has created channels or is an administrator in channels with posting permissions.
        </Text>
        <Button
          title="Sync from Telegram"
          onPress={handleSync}
          loading={syncMutation.isPending}
          leftIcon={<RefreshCw size={18} color="#FFFFFF" />}
          style={styles.emptyButton}
        />
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeaderBanner
        title="Channels"
        subtitle="Manage your broadcast destinations"
        badge={totalCount}
        rightActions={
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              onPress={handleSync}
              disabled={syncMutation.isPending || isRefetching}
              style={styles.frostedSyncButton}
              accessibilityLabel="Sync channels from Telegram"
            >
              {syncMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <RefreshCw size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <NotificationBellButton
              variant="frosted"
              onPress={() => router.push('/notifications')}
            />
          </View>
        }
      />

      <CurvedSheet>
        {/* Channels List */}
        <FlatList
          data={channels}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.sheetHeader}>
              {/* Search & Filter Bar */}
              <ChannelFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterMode={filterMode}
                onFilterModeChange={setFilterMode}
                selectedCount={selectedCount}
                totalCount={totalCount}
              />
            </View>
          }
          renderItem={({ item }) => (
            <ChannelCard
              channel={item}
              onToggleSelect={handleToggleSelect}
              onPressStats={(channel) =>
                router.push({
                  pathname: '/channels/[id]',
                  params: { id: channel.id },
                })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary.DEFAULT}
              colors={[colors.primary.DEFAULT]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      </CurvedSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0077B6',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  frostedSyncButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHeader: {
    marginBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 24,
    paddingBottom: layout.tabBarClearance + 20,
  },
  loadingContainer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.presets.subhead,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    marginVertical: spacing.xl,
  },
  emptyIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.presets.title3,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.presets.subhead,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    marginTop: spacing.xs,
  },
});
