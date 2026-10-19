import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  MessageSquare,
  PenTool,
  Pin,
  Radio,
  RefreshCw,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  XCircle,
  Zap,
} from 'lucide-react-native';

import {
  useChannel,
  useChannelStats,
  useSyncChannels,
  useToggleChannelSelection,
} from '../../hooks/useChannels';
import { ScreenHeaderBanner, CurvedSheet } from '../../components/common/ScreenHeaderBanner';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, layout, spacing } from '../../theme/spacing';

type ChannelTab = 'overview' | 'permissions' | 'analytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ChannelDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const channelId = Array.isArray(id) ? id[0] : id;
  const { data: channel, isLoading: channelLoading, refetch: refetchChannel } = useChannel(channelId ?? null);
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useChannelStats(channelId ?? null);

  const toggleSelectMutation = useToggleChannelSelection();
  const syncMutation = useSyncChannels();

  const [selectedTab, setSelectedTab] = useState<ChannelTab>('overview');

  const isLoading = channelLoading || statsLoading;

  const handleRefresh = async () => {
    await Promise.all([refetchChannel(), refetchStats()]);
  };

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync();
      Alert.alert('Synchronized', 'Channel info and permissions have been refreshed.');
      handleRefresh();
    } catch (err: any) {
      Alert.alert('Sync Failed', err?.message || 'Could not sync channel.');
    }
  };

  const handleToggleSelect = () => {
    if (!channelId || !channel) return;
    toggleSelectMutation.mutate({
      channelId,
      isSelected: !channel.is_selected_by_user,
    });
  };

  const handleComposeForChannel = () => {
    router.push({
      pathname: '/compose',
      params: { preselectedChannelId: channelId },
    });
  };

  if (channelLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeaderBanner
          compact={true}
          showBackButton={true}
          title="Channel Details"
        />
        <CurvedSheet>
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Text style={styles.centerMessage}>Loading channel details...</Text>
          </View>
        </CurvedSheet>
      </View>
    );
  }

  if (!channel) {
    return (
      <View style={styles.container}>
        <ScreenHeaderBanner
          compact={true}
          showBackButton={true}
          title="Channel Details"
        />
        <CurvedSheet>
          <View style={styles.centerBox}>
            <AlertCircle size={44} color={colors.status.error} />
            <Text style={styles.errorTitle}>Channel Not Found</Text>
            <Text style={styles.centerMessage}>This channel could not be loaded or was unlinked.</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </CurvedSheet>
      </View>
    );
  }

  const successRate =
    stats && stats.total_posts_targeted > 0
      ? Math.round((stats.successful_posts / stats.total_posts_targeted) * 100)
      : 100;

  return (
    <View style={styles.container}>
      <ScreenHeaderBanner
        compact={true}
        showBackButton={true}
        title={channel.title}
        rightActions={
          <TouchableOpacity
            onPress={handleSync}
            style={styles.frostedRightButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            disabled={syncMutation.isPending}
            accessibilityLabel="Sync channel"
          >
            {syncMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <RefreshCw size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        }
      />

      <CurvedSheet>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 24, 40) }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary.DEFAULT}
          />
        }
      >
        {/* Channel Hero Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarLetter}>
                {(channel.title || 'C').charAt(0).toUpperCase()}
              </Text>
              <View style={styles.platformBadge}>
                <Radio size={10} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.profileTextCol}>
              <View style={styles.titleRow}>
                <Text style={styles.channelTitle} numberOfLines={1}>
                  {channel.title}
                </Text>
                {channel.is_creator && (
                  <View style={styles.creatorPill}>
                    <Text style={styles.creatorPillText}>Owner</Text>
                  </View>
                )}
              </View>

              {channel.username ? (
                <Text style={styles.channelUsername}>@{channel.username}</Text>
              ) : (
                <Text style={styles.channelUsername}>ID: {channel.telegram_channel_id}</Text>
              )}
            </View>
          </View>

          {/* Quick Selection Toggle Pill */}
          <TouchableOpacity
            onPress={handleToggleSelect}
            style={[
              styles.targetSelectBtn,
              channel.is_selected_by_user && styles.targetSelectBtnActive,
            ]}
            activeOpacity={0.8}
          >
            {channel.is_selected_by_user ? (
              <>
                <CheckCircle2 size={16} color="#34C759" />
                <Text style={[styles.targetSelectBtnText, { color: '#34C759' }]}>
                  Active Broadcast Target
                </Text>
              </>
            ) : (
              <>
                <Radio size={16} color="#64748B" />
                <Text style={styles.targetSelectBtnText}>Tap to Target for Broadcasts</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 4-Card Quick Metrics Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(0, 136, 204, 0.1)' }]}>
              <Users size={16} color="#0088CC" />
            </View>
            <Text style={styles.metricValue}>
              {channel.member_count > 999
                ? `${(channel.member_count / 1000).toFixed(1)}K`
                : channel.member_count}
            </Text>
            <Text style={styles.metricLabel}>Members</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
              <CheckCircle2 size={16} color="#34C759" />
            </View>
            <Text style={styles.metricValue}>{stats?.successful_posts ?? 0}</Text>
            <Text style={styles.metricLabel}>Delivered</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
              <BarChart3 size={16} color="#FF9500" />
            </View>
            <Text style={styles.metricValue}>{successRate}%</Text>
            <Text style={styles.metricLabel}>Success Rate</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(142, 142, 147, 0.1)' }]}>
              <MessageSquare size={16} color="#8E8E93" />
            </View>
            <Text style={styles.metricValue}>{stats?.total_posts_targeted ?? 0}</Text>
            <Text style={styles.metricLabel}>Targeted</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => setSelectedTab('overview')}
            style={[styles.tabItem, selectedTab === 'overview' && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTab('permissions')}
            style={[styles.tabItem, selectedTab === 'permissions' && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, selectedTab === 'permissions' && styles.tabTextActive]}>
              Permissions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTab('analytics')}
            style={[styles.tabItem, selectedTab === 'analytics' && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, selectedTab === 'analytics' && styles.tabTextActive]}>
              Analytics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Overview */}
        {selectedTab === 'overview' && (
          <View style={styles.tabContent}>
            {channel.about && (
              <View style={styles.card}>
                <Text style={styles.cardSectionTitle}>About Channel</Text>
                <Text style={styles.aboutText}>{channel.about}</Text>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Channel Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Platform</Text>
                <Text style={styles.infoVal}>Telegram</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Channel Type</Text>
                <Text style={styles.infoVal}>
                  {channel.is_broadcast ? 'Broadcast Channel' : 'Group / Chat'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Telegram ID</Text>
                <Text style={styles.infoVal}>{channel.telegram_channel_id}</Text>
              </View>
              {stats?.last_published_at && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Last Broadcast</Text>
                  <Text style={styles.infoVal}>
                    {format(new Date(stats.last_published_at), 'MMM d, h:mm a')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Tab 2: Permissions */}
        {selectedTab === 'permissions' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Bot Admin Privileges</Text>
              <Text style={styles.cardSubtitle}>
                Verified Telegram bot permissions for this channel:
              </Text>

              <View style={styles.permList}>
                <View style={styles.permRow}>
                  <Text style={styles.permLabel}>Post Messages</Text>
                  {channel.can_post_messages ? (
                    <View style={styles.permBadgeYes}>
                      <CheckCircle2 size={13} color="#34C759" />
                      <Text style={styles.permBadgeTextYes}>Granted</Text>
                    </View>
                  ) : (
                    <View style={styles.permBadgeNo}>
                      <XCircle size={13} color="#FF3B30" />
                      <Text style={styles.permBadgeTextNo}>Missing</Text>
                    </View>
                  )}
                </View>

                <View style={styles.permRow}>
                  <Text style={styles.permLabel}>Edit Messages</Text>
                  {channel.can_edit_messages ? (
                    <View style={styles.permBadgeYes}>
                      <CheckCircle2 size={13} color="#34C759" />
                      <Text style={styles.permBadgeTextYes}>Granted</Text>
                    </View>
                  ) : (
                    <View style={styles.permBadgeNo}>
                      <XCircle size={13} color="#FF3B30" />
                      <Text style={styles.permBadgeTextNo}>Missing</Text>
                    </View>
                  )}
                </View>

                <View style={styles.permRow}>
                  <Text style={styles.permLabel}>Delete Messages</Text>
                  {channel.can_delete_messages ? (
                    <View style={styles.permBadgeYes}>
                      <CheckCircle2 size={13} color="#34C759" />
                      <Text style={styles.permBadgeTextYes}>Granted</Text>
                    </View>
                  ) : (
                    <View style={styles.permBadgeNo}>
                      <XCircle size={13} color="#FF3B30" />
                      <Text style={styles.permBadgeTextNo}>Missing</Text>
                    </View>
                  )}
                </View>

                <View style={styles.permRow}>
                  <Text style={styles.permLabel}>Pin Messages</Text>
                  {channel.can_pin_messages ? (
                    <View style={styles.permBadgeYes}>
                      <CheckCircle2 size={13} color="#34C759" />
                      <Text style={styles.permBadgeTextYes}>Granted</Text>
                    </View>
                  ) : (
                    <View style={styles.permBadgeNo}>
                      <XCircle size={13} color="#FF3B30" />
                      <Text style={styles.permBadgeTextNo}>Missing</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Tab 3: Analytics */}
        {selectedTab === 'analytics' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Delivery Statistics</Text>

              <View style={styles.breakdownRow}>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownNum, { color: '#34C759' }]}>
                    {stats?.successful_posts ?? 0}
                  </Text>
                  <Text style={styles.breakdownLabel}>Successful</Text>
                </View>
                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownNum, { color: '#FF9500' }]}>
                    {stats?.pending_posts ?? 0}
                  </Text>
                  <Text style={styles.breakdownLabel}>Pending</Text>
                </View>
                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownNum, { color: '#FF3B30' }]}>
                    {stats?.failed_posts ?? 0}
                  </Text>
                  <Text style={styles.breakdownLabel}>Failed</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Primary Action Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            onPress={handleComposeForChannel}
            style={styles.primaryBtn}
            activeOpacity={0.8}
          >
            <PenTool size={18} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Compose for this Channel</Text>
          </TouchableOpacity>
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
  frostedRightButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.presets.title2,
    color: '#0F172A',
    fontSize: 18,
    maxWidth: SCREEN_WIDTH * 0.65,
  },
  syncHeaderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 136, 204, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0088CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
  },
  avatarLetter: {
    ...typography.presets.title1,
    color: '#FFFFFF',
    fontSize: 24,
  },
  platformBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2AABEE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileTextCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  channelTitle: {
    ...typography.presets.title2,
    color: '#0F172A',
    fontSize: 18,
    maxWidth: '80%',
  },
  creatorPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },
  creatorPillText: {
    ...typography.presets.caption,
    fontSize: 10.5,
    color: '#34C759',
  },
  channelUsername: {
    ...typography.presets.caption,
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
  },
  targetSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  targetSelectBtnActive: {
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    borderColor: 'rgba(52, 199, 89, 0.25)',
  },
  targetSelectBtnText: {
    ...typography.presets.button,
    fontSize: 13,
    color: '#64748B',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricValue: {
    ...typography.presets.title2,
    color: '#0F172A',
    fontSize: 16,
  },
  metricLabel: {
    ...typography.presets.caption,
    color: '#64748B',
    fontSize: 10.5,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },
  tabText: {
    ...typography.presets.caption,
    fontSize: 13,
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  tabContent: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardSectionTitle: {
    ...typography.presets.title3,
    color: '#0F172A',
    fontSize: 15,
    marginBottom: 10,
  },
  cardSubtitle: {
    ...typography.presets.caption,
    color: '#64748B',
    fontSize: 12,
    marginBottom: 12,
  },
  aboutText: {
    ...typography.presets.body,
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    ...typography.presets.caption,
    color: '#64748B',
    fontSize: 13,
  },
  infoVal: {
    ...typography.presets.bodyMedium,
    color: '#0F172A',
    fontSize: 13,
  },
  permList: {
    gap: 10,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  permLabel: {
    ...typography.presets.body,
    color: '#0F172A',
    fontSize: 14,
  },
  permBadgeYes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  permBadgeTextYes: {
    ...typography.presets.caption,
    fontSize: 11,
    color: '#34C759',
  },
  permBadgeNo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  permBadgeTextNo: {
    ...typography.presets.caption,
    fontSize: 11,
    color: '#FF3B30',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownNum: {
    ...typography.presets.title1,
    fontSize: 22,
  },
  breakdownLabel: {
    ...typography.presets.caption,
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  breakdownDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  actionSection: {
    marginTop: 16,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0088CC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: { shadowColor: '#0088CC', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  primaryBtnText: {
    ...typography.presets.button,
    color: '#FFFFFF',
    fontSize: 16,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerMessage: {
    ...typography.presets.body,
    color: '#64748B',
    marginTop: 10,
    textAlign: 'center',
  },
  errorTitle: {
    ...typography.presets.title2,
    color: '#0F172A',
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
    borderRadius: 20,
  },
  retryButtonText: {
    ...typography.presets.button,
    color: '#FFFFFF',
    fontSize: 14,
  },
});
