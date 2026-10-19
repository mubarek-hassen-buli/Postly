import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  MessageSquare,
  Pin,
  RefreshCw,
  Send,
  Shield,
  Sparkles,
  Trash2,
  Users,
  XCircle,
  Zap,
} from 'lucide-react-native';
import { ChannelItem } from '../../services/channels/channelService';
import { useChannelStats, useSyncChannels } from '../../hooks/useChannels';
import { useDetailModalStore } from '../../store/useDetailModalStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface ChannelStatsModalProps {
  channel: ChannelItem | null;
  visible: boolean;
  onClose: () => void;
  onComposeForChannel?: (channelId: string) => void;
}

type ChannelTab = 'overview' | 'permissions' | 'analytics';

export const ChannelStatsModal: React.FC<ChannelStatsModalProps> = ({
  channel,
  visible,
  onClose,
  onComposeForChannel,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const sheetHeight = Math.min(screenHeight * 0.65, 580);

  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const [rendered, setRendered] = useState(visible);
  const [activeChannel, setActiveChannel] = useState<ChannelItem | null>(channel);

  // Inspiration interactive states
  const [selectedTab, setSelectedTab] = useState<ChannelTab>('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    permissions: true,
    performance: true,
    config: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (channel) {
      setActiveChannel(channel);
    }
  }, [channel]);

  const targetChannel = channel || activeChannel;
  const { data: stats, isLoading, refetch: refetchStats } = useChannelStats(targetChannel?.id ?? null);
  const syncChannelsMutation = useSyncChannels();

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: sheetHeight,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setRendered(false);
      useDetailModalStore.getState().setDetailModalOpen(false);
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      setRendered(true);
      useDetailModalStore.getState().setDetailModalOpen(true);
      Animated.spring(translateY, {
        toValue: 0,
        damping: 24,
        mass: 0.85,
        stiffness: 220,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: sheetHeight,
        duration: 200,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setRendered(false);
          useDetailModalStore.getState().setDetailModalOpen(false);
        }
      });
    }
  }, [visible, sheetHeight]);

  useEffect(() => {
    return () => {
      useDetailModalStore.getState().setDetailModalOpen(false);
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 8,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.6) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            damping: 24,
            mass: 0.85,
            stiffness: 220,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!rendered || !targetChannel) return null;

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    await Promise.all([
      syncChannelsMutation.mutateAsync().catch(() => {}),
      refetchStats().catch(() => {}),
    ]);
  };

  const handleCompose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    handleClose();
    if (onComposeForChannel) {
      onComposeForChannel(targetChannel.id);
    } else {
      router.push('/compose');
    }
  };

  const memberCount = ((stats?.member_count ?? targetChannel.member_count) ?? 0);
  const totalPosts = stats?.total_posts_targeted ?? 0;
  const successfulPosts = stats?.successful_posts ?? 0;
  const failedPosts = stats?.failed_posts ?? 0;
  const successRate = totalPosts > 0 ? Math.round((successfulPosts / totalPosts) * 100) : 100;

  return (
    <View style={styles.sheetOverlay} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            height: sheetHeight,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 6 : 16,
            transform: [{ translateY }],
          },
        ]}
        pointerEvents="auto"
      >
        {/* Drag Indicator */}
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
        </View>

        {/* Header Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.circleButton}
            accessibilityLabel="Close channel details"
          >
            <ArrowLeft size={18} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.navCenter}>
            <Text style={styles.navSubtitle}>
              {targetChannel.username ? `@${targetChannel.username}` : `TELEGRAM ENDPOINT`}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSync}
            style={styles.circleButton}
            accessibilityLabel="Refresh channel statistics"
          >
            <RefreshCw
              size={18}
              color={colors.primary.DEFAULT}
              style={syncChannelsMutation.isPending ? styles.rotating : undefined}
            />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Hero Showcase Section */}
          <View style={styles.heroSection}>
            <View style={styles.channelHeroCard}>
              <View style={styles.avatarRow}>
                <View style={styles.channelAvatar}>
                  <Text style={styles.channelAvatarLetter}>
                    {targetChannel.title.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.channelHeroMeta}>
                  <View style={styles.verifiedRow}>
                    <Shield size={14} color={colors.primary.DEFAULT} />
                    <Text style={styles.verifiedText}>Verified Telegram Endpoint</Text>
                  </View>
                  <Text style={styles.endpointStatus}>
                    {targetChannel.can_post_messages ? '● Ready for Broadcasting' : '● Restricted Admin Rights'}
                  </Text>
                </View>
              </View>

              {/* Inspo Highlight Metric Bar inside Hero */}
              <View style={styles.heroMetricRow}>
                <View style={styles.heroMetricBox}>
                  <Users size={16} color={colors.primary.DEFAULT} />
                  <Text style={styles.heroMetricValue}>{memberCount.toLocaleString()}</Text>
                  <Text style={styles.heroMetricLabel}>Subscribers</Text>
                </View>
                <View style={styles.heroMetricDivider} />
                <View style={styles.heroMetricBox}>
                  <BarChart3 size={16} color={colors.status.success} />
                  <Text style={styles.heroMetricValue}>{successRate}%</Text>
                  <Text style={styles.heroMetricLabel}>Success Rate</Text>
                </View>
                <View style={styles.heroMetricDivider} />
                <View style={styles.heroMetricBox}>
                  <Send size={16} color={colors.status.info} />
                  <Text style={styles.heroMetricValue}>{totalPosts}</Text>
                  <Text style={styles.heroMetricLabel}>Broadcasts</Text>
                </View>
              </View>

              {/* Indicator Dots under Hero */}
              <View style={styles.paginationRow}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={[styles.dot, styles.dotInactive]} />
                <View style={[styles.dot, styles.dotInactive]} />
              </View>
            </View>
          </View>

          {/* 2. Title & Metric Headline Row */}
          <View style={styles.headerInfoRow}>
            <View style={styles.titleColumn}>
              <Text style={styles.brandSubtitle}>TELEGRAM BROADCAST</Text>
              <Text style={styles.productTitle} numberOfLines={2}>
                {targetChannel.title}
              </Text>
            </View>

            <View style={styles.statBadgeBig}>
              <Text style={styles.statBadgeBigText}>
                {memberCount > 999 ? `${(memberCount / 1000).toFixed(1)}k` : memberCount}
              </Text>
              <Text style={styles.statBadgeBigSub}>Members</Text>
            </View>
          </View>

          {/* 3. Rating / Meta Row (Inspo: ★ 4.8 (217 Reviews)) */}
          <View style={styles.metaRatingRow}>
            <View style={styles.ratingBadge}>
              <View style={[styles.ratingDot, { backgroundColor: colors.status.success }]} />
              <Text style={styles.ratingText}>
                {targetChannel.is_selected_by_user ? 'Active Target Endpoint' : 'Standby Channel'}
              </Text>
            </View>
            <Text style={styles.metaDivider}>•</Text>
            <Text style={styles.metaTimestamp}>
              ID: #{targetChannel.telegram_channel_id}
            </Text>
          </View>

          {/* 4. Segmented Oval Pill Selector (Inspo: ( 30ml )  ( 100ml )  ( 150ml )) */}
          <View style={styles.pillSelectorRow}>
            <TouchableOpacity
              onPress={() => setSelectedTab('overview')}
              style={[
                styles.ovalPill,
                selectedTab === 'overview' ? styles.ovalPillActive : styles.ovalPillInactive,
              ]}
            >
              <Text
                style={[
                  styles.ovalPillText,
                  selectedTab === 'overview' ? styles.ovalPillTextActive : styles.ovalPillTextInactive,
                ]}
              >
                Overview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab('permissions')}
              style={[
                styles.ovalPill,
                selectedTab === 'permissions' ? styles.ovalPillActive : styles.ovalPillInactive,
              ]}
            >
              <Text
                style={[
                  styles.ovalPillText,
                  selectedTab === 'permissions' ? styles.ovalPillTextActive : styles.ovalPillTextInactive,
                ]}
              >
                Permissions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab('analytics')}
              style={[
                styles.ovalPill,
                selectedTab === 'analytics' ? styles.ovalPillActive : styles.ovalPillInactive,
              ]}
            >
              <Text
                style={[
                  styles.ovalPillText,
                  selectedTab === 'analytics' ? styles.ovalPillTextActive : styles.ovalPillTextInactive,
                ]}
              >
                Analytics
              </Text>
            </TouchableOpacity>
          </View>

          {/* 5. Clean Description Block */}
          <View style={styles.descriptionBlock}>
            <Text style={styles.descriptionText}>
              Broadcasts dispatched to this endpoint are signed with your authenticated Telegram bot session. Posts respect scheduled dispatch times, auto-pin directives, and HTML formatting.
            </Text>
          </View>

          {/* 6. Accordion / Disclosure Card (Inspo List Card with Chevrons) */}
          <View style={styles.accordionCard}>
            {/* Row 1: Admin Permissions */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleSection('permissions')}
              style={styles.accordionHeaderRow}
            >
              <View style={styles.accordionTitleWithIcon}>
                <Shield size={16} color={colors.primary.DEFAULT} style={styles.rowIcon} />
                <Text style={styles.accordionTitle}>Admin Permissions & Rights</Text>
              </View>
              {expandedSections.permissions ? (
                <ChevronDown size={18} color={colors.text.muted} />
              ) : (
                <ChevronRight size={18} color={colors.text.muted} />
              )}
            </TouchableOpacity>

            {expandedSections.permissions && (
              <View style={styles.accordionContent}>
                <View style={styles.permRow}>
                  <Text style={styles.permLabel}>Post Messages</Text>
                  <View style={[styles.permPill, targetChannel.can_post_messages ? styles.permPillAllowed : styles.permPillDenied]}>
                    <Text style={[styles.permPillText, targetChannel.can_post_messages ? { color: colors.status.success } : { color: colors.status.error }]}>
                      {targetChannel.can_post_messages ? 'Granted' : 'Restricted'}
                    </Text>
                  </View>
                </View>

                <View style={styles.permRow}>
                  <Text style={styles.permLabel}>Edit Messages</Text>
                  <View style={[styles.permPill, targetChannel.can_edit_messages ? styles.permPillAllowed : styles.permPillDenied]}>
                    <Text style={[styles.permPillText, targetChannel.can_edit_messages ? { color: colors.status.success } : { color: colors.status.error }]}>
                      {targetChannel.can_edit_messages ? 'Granted' : 'Restricted'}
                    </Text>
                  </View>
                </View>

                <View style={styles.permRow}>
                  <Text style={styles.permLabel}>Delete Messages</Text>
                  <View style={[styles.permPill, targetChannel.can_delete_messages ? styles.permPillAllowed : styles.permPillDenied]}>
                    <Text style={[styles.permPillText, targetChannel.can_delete_messages ? { color: colors.status.success } : { color: colors.status.error }]}>
                      {targetChannel.can_delete_messages ? 'Granted' : 'Restricted'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.permRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.permLabel}>Pin Messages</Text>
                  <View style={[styles.permPill, targetChannel.can_pin_messages ? styles.permPillAllowed : styles.permPillDenied]}>
                    <Text style={[styles.permPillText, targetChannel.can_pin_messages ? { color: colors.status.success } : { color: colors.status.error }]}>
                      {targetChannel.can_pin_messages ? 'Granted' : 'Restricted'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.cardDivider} />

            {/* Row 2: Performance & Delivery Stats */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleSection('performance')}
              style={styles.accordionHeaderRow}
            >
              <View style={styles.accordionTitleWithIcon}>
                <BarChart3 size={16} color={colors.status.success} style={styles.rowIcon} />
                <Text style={styles.accordionTitle}>Delivery Performance ({successRate}%)</Text>
              </View>
              {expandedSections.performance ? (
                <ChevronDown size={18} color={colors.text.muted} />
              ) : (
                <ChevronRight size={18} color={colors.text.muted} />
              )}
            </TouchableOpacity>

            {expandedSections.performance && (
              <View style={styles.accordionContent}>
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.primary.DEFAULT} style={{ paddingVertical: 10 }} />
                ) : (
                  <>
                    <View style={styles.progressBarWrapper}>
                      <View style={[styles.progressBarFill, { width: `${successRate}%` }]} />
                    </View>

                    <View style={styles.statsSummaryGrid}>
                      <View style={styles.statsMiniBox}>
                        <Text style={styles.statsMiniNum}>{successfulPosts}</Text>
                        <Text style={styles.statsMiniLabel}>Delivered</Text>
                      </View>
                      <View style={styles.statsMiniBox}>
                        <Text style={[styles.statsMiniNum, failedPosts > 0 && { color: colors.status.error }]}>
                          {failedPosts}
                        </Text>
                        <Text style={styles.statsMiniLabel}>Failed</Text>
                      </View>
                      <View style={styles.statsMiniBox}>
                        <Text style={styles.statsMiniNum}>{totalPosts}</Text>
                        <Text style={styles.statsMiniLabel}>Total Targets</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            )}

            <View style={styles.cardDivider} />

            {/* Row 3: Identity & Configuration */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleSection('config')}
              style={styles.accordionHeaderRow}
            >
              <View style={styles.accordionTitleWithIcon}>
                <MessageSquare size={16} color={colors.text.secondary} style={styles.rowIcon} />
                <Text style={styles.accordionTitle}>Channel Identification</Text>
              </View>
              {expandedSections.config ? (
                <ChevronDown size={18} color={colors.text.muted} />
              ) : (
                <ChevronRight size={18} color={colors.text.muted} />
              )}
            </TouchableOpacity>

            {expandedSections.config && (
              <View style={styles.accordionContent}>
                <View style={styles.infoKeyValue}>
                  <Text style={styles.infoKey}>Telegram ID</Text>
                  <Text style={[styles.infoVal, { fontFamily: 'monospace' }]}>
                    {targetChannel.telegram_channel_id}
                  </Text>
                </View>
                <View style={styles.infoKeyValue}>
                  <Text style={styles.infoKey}>Public Handle</Text>
                  <Text style={styles.infoVal}>
                    {targetChannel.username ? `@${targetChannel.username}` : 'Private Channel'}
                  </Text>
                </View>
                <View style={styles.infoKeyValue}>
                  <Text style={styles.infoKey}>Selection State</Text>
                  <Text style={styles.infoVal}>
                    {targetChannel.is_selected_by_user ? 'Selected Default' : 'Optional'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* 7. Sticky Bottom Action Bar (Inspo: [- 1 +] on left, [Add to Cart] on right) */}
        <View style={styles.stickyBottomBar}>
          {/* Secondary Refresh/Sync Pill on Left */}
          <TouchableOpacity
            onPress={handleSync}
            style={styles.stepperPill}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Sync channel stats"
          >
            <RefreshCw size={18} color={colors.text.primary} />
          </TouchableOpacity>

          {/* Primary CTA on Right: "Create Post for Channel" */}
          <TouchableOpacity
            onPress={handleCompose}
            style={styles.primaryActionButton}
          >
            <Send size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryActionText}>Create Post for Channel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 28,
      },
    }),
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCenter: {
    alignItems: 'center',
  },
  navSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#94A3B8',
  },
  rotating: {
    transform: [{ rotate: '45deg' }],
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroSection: {
    marginBottom: 16,
    alignItems: 'center',
  },
  channelHeroCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  channelAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  channelAvatarLetter: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  channelHeroMeta: {
    flex: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  endpointStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.status.success,
  },
  heroMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroMetricBox: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  heroMetricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  heroMetricLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  heroMetricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 18,
    backgroundColor: '#0F172A',
  },
  dotInactive: {
    width: 5,
    backgroundColor: '#CBD5E1',
  },
  headerInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleColumn: {
    flex: 1,
    paddingRight: 12,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
  },
  statBadgeBig: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statBadgeBigText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statBadgeBigSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metaRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  metaDivider: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  metaTimestamp: {
    fontSize: 13,
    color: '#64748B',
  },
  pillSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  ovalPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  ovalPillActive: {
    borderColor: '#0F172A',
    backgroundColor: '#0F172A',
  },
  ovalPillInactive: {
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  ovalPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ovalPillTextActive: {
    color: '#FFFFFF',
  },
  ovalPillTextInactive: {
    color: '#475569',
  },
  descriptionBlock: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14.5,
    color: '#475569',
    lineHeight: 22,
  },
  accordionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  accordionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  accordionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 10,
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  permLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  permPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  permPillAllowed: {
    backgroundColor: colors.status.successBg,
  },
  permPillDenied: {
    backgroundColor: colors.status.errorBg,
  },
  permPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarWrapper: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.status.success,
    borderRadius: 4,
  },
  statsSummaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  statsMiniBox: {
    alignItems: 'center',
    flex: 1,
  },
  statsMiniNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statsMiniLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  infoKeyValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  infoKey: {
    fontSize: 13,
    color: '#64748B',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  stickyBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  stepperPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary.DEFAULT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
