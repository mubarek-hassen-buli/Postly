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
import * as Haptics from 'expo-haptics';
import {
  CheckCircle,
  Clock,
  Pin,
  Send,
  Shield,
  Trash2,
  Users,
  X,
  XCircle,
} from 'lucide-react-native';
import { ChannelItem } from '../../services/channels/channelService';
import { useChannelStats } from '../../hooks/useChannels';
import { useDetailModalStore } from '../../store/useDetailModalStore';
import { Card } from '../ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface ChannelStatsModalProps {
  channel: ChannelItem | null;
  visible: boolean;
  onClose: () => void;
}

export const ChannelStatsModal: React.FC<ChannelStatsModalProps> = ({
  channel,
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const sheetHeight = Math.min(screenHeight * 0.64, 560);

  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const [rendered, setRendered] = useState(visible);
  const [activeChannel, setActiveChannel] = useState<ChannelItem | null>(channel);

  useEffect(() => {
    if (channel) {
      setActiveChannel(channel);
    }
  }, [channel]);

  const targetChannel = channel || activeChannel;
  const { data: stats, isLoading } = useChannelStats(targetChannel?.id ?? null);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
        damping: 20,
        mass: 0.8,
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
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 6,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 90 || gestureState.vy > 0.6) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            damping: 20,
            mass: 0.8,
            stiffness: 220,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!rendered || !targetChannel) return null;

  return (
    <View style={styles.sheetOverlay} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            height: sheetHeight,
            paddingBottom: Math.max(insets.bottom + 12, 24),
            transform: [{ translateY }],
          },
        ]}
        pointerEvents="auto"
      >
        {/* TikTok Drag Handle Pill */}
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
        </View>

        {/* Header */}
        <View style={styles.headerRow} {...panResponder.panHandlers}>
          <View style={styles.titleArea}>
            <Text style={styles.title} numberOfLines={1}>{targetChannel.title}</Text>
            <Text style={styles.username}>
              {targetChannel.username ? `@${targetChannel.username}` : `ID: ${targetChannel.telegram_channel_id}`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Close channel details"
          >
            <X size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Text style={styles.loadingText}>Fetching channel statistics...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Metrics Grid */}
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <Users size={20} color={colors.primary.DEFAULT} style={styles.statIcon} />
                <Text style={styles.statNumber}>
                  {((stats?.member_count ?? targetChannel.member_count) ?? 0).toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Subscribers</Text>
              </Card>

              <Card style={styles.statCard}>
                <Send size={20} color={colors.status.info} style={styles.statIcon} />
                <Text style={styles.statNumber}>{stats?.total_posts_targeted ?? 0}</Text>
                <Text style={styles.statLabel}>Total Posts</Text>
              </Card>
            </View>

            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <CheckCircle size={20} color={colors.status.success} style={styles.statIcon} />
                <Text style={styles.statNumber}>{stats?.successful_posts ?? 0}</Text>
                <Text style={styles.statLabel}>Delivered</Text>
              </Card>

              <Card style={styles.statCard}>
                <XCircle size={20} color={colors.status.error} style={styles.statIcon} />
                <Text style={styles.statNumber}>{stats?.failed_posts ?? 0}</Text>
                <Text style={styles.statLabel}>Failed</Text>
              </Card>
            </View>

            {/* Administrative Permissions */}
            <Text style={styles.sectionHeader}>Admin Permissions</Text>
            <Card style={styles.permissionsCard}>
              <View style={styles.permRow}>
                <Shield size={16} color={targetChannel.can_post_messages ? colors.status.success : colors.text.muted} />
                <Text style={styles.permLabel}>Post Messages</Text>
                <Text style={[styles.permStatus, targetChannel.can_post_messages && styles.permGranted]}>
                  {targetChannel.can_post_messages ? 'Allowed' : 'Denied'}
                </Text>
              </View>

              <View style={styles.permRow}>
                <Clock size={16} color={targetChannel.can_edit_messages ? colors.status.success : colors.text.muted} />
                <Text style={styles.permLabel}>Edit Messages</Text>
                <Text style={[styles.permStatus, targetChannel.can_edit_messages && styles.permGranted]}>
                  {targetChannel.can_edit_messages ? 'Allowed' : 'Denied'}
                </Text>
              </View>

              <View style={styles.permRow}>
                <Trash2 size={16} color={targetChannel.can_delete_messages ? colors.status.success : colors.text.muted} />
                <Text style={styles.permLabel}>Delete Messages</Text>
                <Text style={[styles.permStatus, targetChannel.can_delete_messages && styles.permGranted]}>
                  {targetChannel.can_delete_messages ? 'Allowed' : 'Denied'}
                </Text>
              </View>

              <View style={[styles.permRow, styles.lastPermRow]}>
                <Pin size={16} color={targetChannel.can_pin_messages ? colors.status.success : colors.text.muted} />
                <Text style={styles.permLabel}>Pin Messages</Text>
                <Text style={[styles.permStatus, targetChannel.can_pin_messages && styles.permGranted]}>
                  {targetChannel.can_pin_messages ? 'Allowed' : 'Denied'}
                </Text>
              </View>
            </Card>
          </ScrollView>
        )}
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
    zIndex: 100,
  },
  sheetContainer: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    borderTopWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleArea: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    ...typography.presets.title2,
    color: colors.text.primary,
    fontWeight: '700',
  },
  username: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.presets.subhead,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  statIcon: {
    marginBottom: spacing.xs,
  },
  statNumber: {
    ...typography.presets.title2,
    color: colors.text.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  sectionHeader: {
    ...typography.presets.subheadMedium,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  permissionsCard: {
    padding: spacing.md,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  lastPermRow: {
    borderBottomWidth: 0,
  },
  permLabel: {
    ...typography.presets.subhead,
    color: colors.text.primary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  permStatus: {
    ...typography.presets.caption,
    color: colors.text.muted,
    fontWeight: '600',
  },
  permGranted: {
    color: colors.status.success,
  },
});
