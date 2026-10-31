import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
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
import { format } from 'date-fns';
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit3,
  ExternalLink,
  FileText,
  Layers,
  MessageSquare,
  Pin,
  Send,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react-native';
import { TelegramIcon } from '../common/BrandIcons';
import { PostItem } from '../../services/posts/postService';
import { useDetailModalStore } from '../../store/useDetailModalStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface PostDetailModalProps {
  post: PostItem | null;
  visible: boolean;
  onClose: () => void;
  onEdit?: (post: PostItem) => void;
  onPublishNow?: (postId: string) => void;
  onCancelSchedule?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

type TabFilter = 'overview' | 'channels' | 'schedule';

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  visible,
  onClose,
  onEdit,
  onPublishNow,
  onCancelSchedule,
  onDelete,
}) => {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const sheetHeight = Math.min(screenHeight * 0.65, 580);

  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const [rendered, setRendered] = useState(visible);
  const [activePost, setActivePost] = useState<PostItem | null>(post);

  // Inspiration-inspired interactive states
  const [selectedTab, setSelectedTab] = useState<TabFilter>('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Accordion expansion states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    targets: true,
    schedule: false,
    options: false,
    metadata: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (post) {
      setActivePost(post);
      setIsBookmarked(post.pin_message);
    }
  }, [post]);

  const targetPost = post || activePost;

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

  if (!rendered || !targetPost) return null;

  const handleDelete = () => {
    if (!onDelete) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    const isSent = targetPost.status === 'PUBLISHED';
    const message = isSent
      ? 'This will delete this broadcast from Postly and retract it from your connected channels.'
      : 'Are you sure you want to delete this broadcast?';

    Alert.alert('Delete Broadcast', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          handleClose();
          onDelete(targetPost.id);
        },
      },
    ]);
  };

  const mediaList = targetPost.media_attachments || [];
  const targets = targetPost.targets || [];
  const contentSnippet = targetPost.content || targetPost.text_content || 'No text content provided';
  const displayTitle = contentSnippet.split('\n')[0].trim().slice(0, 60) || 'Broadcast Details';

  // Status mapping
  const statusColorMap: Record<PostItem['status'], string> = {
    PUBLISHED: colors.status.success,
    SCHEDULED: colors.status.warning,
    PUBLISHING: colors.primary.DEFAULT,
    DRAFT: colors.text.muted,
    CANCELLED: colors.text.muted,
    FAILED: colors.status.error,
  };
  const statusBgMap: Record<PostItem['status'], string> = {
    PUBLISHED: colors.status.successBg,
    SCHEDULED: colors.status.warningBg,
    PUBLISHING: colors.primary.subtle,
    DRAFT: colors.background.highlight,
    CANCELLED: colors.background.highlight,
    FAILED: colors.status.errorBg,
  };

  const currentStatusColor = statusColorMap[targetPost.status] || colors.primary.DEFAULT;
  const currentStatusBg = statusBgMap[targetPost.status] || colors.primary.subtle;

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
        {/* Top Drag Indicator */}
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
        </View>

        {/* Header Navigation Bar (Left Back Circle, Right Action Circle) */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.circleButton}
            accessibilityLabel="Close post details"
          >
            <ArrowLeft size={18} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.navCenter}>
            <Text style={styles.navSubtitle}>
              {targetPost.formatting_mode} MODE
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setIsBookmarked(!isBookmarked);
            }}
            style={[styles.circleButton, isBookmarked && styles.circleButtonActive]}
            accessibilityLabel="Pin post"
          >
            <Bookmark
              size={18}
              color={isBookmarked ? colors.primary.DEFAULT : colors.text.primary}
              fill={isBookmarked ? colors.primary.DEFAULT : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Main Scrollable Body */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Hero Showcase Section */}
          <View style={styles.heroSection}>
            {mediaList.length > 0 ? (
              <View style={styles.mediaGalleryContainer}>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={(e) => {
                    const slide = Math.round(
                      e.nativeEvent.contentOffset.x / (Dimensions.get('window').width - 48)
                    );
                    setActiveMediaIndex(slide);
                  }}
                  scrollEventThrottle={16}
                  style={styles.mediaScrollView}
                >
                  {mediaList.map((item, index) => (
                    <View key={item.id || index} style={styles.mediaSlide}>
                      <Image
                        source={{ uri: item.media_url }}
                        style={styles.heroImage}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </ScrollView>

                {/* Pagination Dots (— • • • style) */}
                {mediaList.length > 1 && (
                  <View style={styles.paginationRow}>
                    {mediaList.map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.dot,
                          activeMediaIndex === i ? styles.dotActive : styles.dotInactive,
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              /* High-end Telegram Quote Preview Showcase */
              <View style={styles.textHeroCard}>
                <View style={styles.textHeroBadgeRow}>
                  <View style={styles.channelChip}>
                    <TelegramIcon size={13} color={colors.primary.DEFAULT} />
                    <Text style={styles.channelChipText}>Telegram Broadcast</Text>
                  </View>
                  {targetPost.pin_message && (
                    <View style={styles.pinnedChip}>
                      <Pin size={11} color={colors.status.warning} />
                      <Text style={styles.pinnedChipText}>Pinned</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.textHeroSnippet} numberOfLines={4}>
                  "{contentSnippet}"
                </Text>

                <View style={styles.textHeroFooter}>
                  <Text style={styles.textHeroTime}>
                    {format(new Date(targetPost.created_at), 'MMM d, yyyy • h:mm a')}
                  </Text>
                  <View style={styles.checkRow}>
                    <CheckCircle size={14} color={currentStatusColor} />
                    <Text style={[styles.statusTextMini, { color: currentStatusColor }]}>
                      {targetPost.status}
                    </Text>
                  </View>
                </View>

                {/* Subtle Indicator Bar */}
                <View style={styles.paginationRow}>
                  <View style={[styles.dot, styles.dotActive]} />
                  <View style={[styles.dot, styles.dotInactive]} />
                </View>
              </View>
            )}
          </View>

          {/* 2. Title & Status Row (Inspo Headline & Price-Style Metric) */}
          <View style={styles.headerInfoRow}>
            <View style={styles.titleColumn}>
              <Text style={styles.brandSubtitle}>
                {targetPost.formatting_mode} BROADCAST
              </Text>
              <Text style={styles.productTitle} numberOfLines={2}>
                {displayTitle}
              </Text>
            </View>

            <View style={[styles.statusBadgeBig, { backgroundColor: currentStatusBg }]}>
              <Text style={[styles.statusBadgeBigText, { color: currentStatusColor }]}>
                {targetPost.status}
              </Text>
            </View>
          </View>

          {/* 3. Rating / Meta Row (Inspo: ★ 4.8 (217 Reviews)) */}
          <View style={styles.metaRatingRow}>
            <View style={styles.ratingBadge}>
              <View style={[styles.ratingDot, { backgroundColor: currentStatusColor }]} />
              <Text style={styles.ratingText}>
                {targets.length > 0 ? `${targets.length} Target Channel${targets.length > 1 ? 's' : ''}` : 'Direct Dispatch'}
              </Text>
            </View>
            <Text style={styles.metaDivider}>•</Text>
            <Text style={styles.metaTimestamp}>
              {format(new Date(targetPost.created_at), 'MMMM d, yyyy')}
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
              onPress={() => setSelectedTab('channels')}
              style={[
                styles.ovalPill,
                selectedTab === 'channels' ? styles.ovalPillActive : styles.ovalPillInactive,
              ]}
            >
              <Text
                style={[
                  styles.ovalPillText,
                  selectedTab === 'channels' ? styles.ovalPillTextActive : styles.ovalPillTextInactive,
                ]}
              >
                Channels ({targets.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab('schedule')}
              style={[
                styles.ovalPill,
                selectedTab === 'schedule' ? styles.ovalPillActive : styles.ovalPillInactive,
              ]}
            >
              <Text
                style={[
                  styles.ovalPillText,
                  selectedTab === 'schedule' ? styles.ovalPillTextActive : styles.ovalPillTextInactive,
                ]}
              >
                {targetPost.scheduled_for ? 'Scheduled' : 'Settings'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 5. Clean Description Block */}
          <View style={styles.descriptionBlock}>
            <Text style={styles.descriptionText}>
              {contentSnippet}
            </Text>
          </View>

          {/* 6. Accordion / Disclosure Card (Inspo List Card with Chevrons) */}
          <View style={styles.accordionCard}>
            {/* Row 1: Target Channels */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleSection('targets')}
              style={styles.accordionHeaderRow}
            >
              <View style={styles.accordionTitleWithIcon}>
                <Send size={16} color={colors.primary.DEFAULT} style={styles.rowIcon} />
                <Text style={styles.accordionTitle}>Target Channels & Delivery</Text>
              </View>
              {expandedSections.targets ? (
                <ChevronDown size={18} color={colors.text.muted} />
              ) : (
                <ChevronRight size={18} color={colors.text.muted} />
              )}
            </TouchableOpacity>

            {expandedSections.targets && (
              <View style={styles.accordionContent}>
                {targets.length === 0 ? (
                  <Text style={styles.emptyNotice}>No channel targets recorded.</Text>
                ) : (
                  targets.map((tgt, idx) => {
                    const isSuccess = tgt.status === 'SUCCESS';
                    const isFailed = tgt.status === 'FAILED';
                    return (
                      <View
                        key={tgt.id || idx}
                        style={[
                          styles.targetItemRow,
                          idx === targets.length - 1 && { borderBottomWidth: 0 },
                        ]}
                      >
                        <View style={styles.targetLeft}>
                          {isSuccess ? (
                            <CheckCircle size={16} color={colors.status.success} />
                          ) : isFailed ? (
                            <XCircle size={16} color={colors.status.error} />
                          ) : (
                            <Clock size={16} color={colors.status.warning} />
                          )}
                          <View style={styles.targetNameCol}>
                            <Text style={styles.targetTitle}>
                              {tgt.channel?.title || 'Telegram Channel'}
                            </Text>
                            {tgt.telegram_message_id && (
                              <Text style={styles.targetSub}>
                                Message ID: #{tgt.telegram_message_id}
                              </Text>
                            )}
                            {tgt.error_message && (
                              <Text style={styles.targetError}>{tgt.error_message}</Text>
                            )}
                          </View>
                        </View>
                        <View
                          style={[
                            styles.targetBadge,
                            isSuccess && { backgroundColor: colors.status.successBg },
                            isFailed && { backgroundColor: colors.status.errorBg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.targetBadgeText,
                              isSuccess && { color: colors.status.success },
                              isFailed && { color: colors.status.error },
                            ]}
                          >
                            {tgt.status}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            <View style={styles.cardDivider} />

            {/* Row 2: Schedule & Automation */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleSection('schedule')}
              style={styles.accordionHeaderRow}
            >
              <View style={styles.accordionTitleWithIcon}>
                <Calendar size={16} color={colors.status.warning} style={styles.rowIcon} />
                <Text style={styles.accordionTitle}>Schedule & Automation</Text>
              </View>
              {expandedSections.schedule ? (
                <ChevronDown size={18} color={colors.text.muted} />
              ) : (
                <ChevronRight size={18} color={colors.text.muted} />
              )}
            </TouchableOpacity>

            {expandedSections.schedule && (
              <View style={styles.accordionContent}>
                <View style={styles.infoKeyValue}>
                  <Text style={styles.infoKey}>Scheduled ETA</Text>
                  <Text style={styles.infoVal}>
                    {targetPost.scheduled_for
                      ? format(new Date(targetPost.scheduled_for), 'EEEE, MMM d, yyyy @ h:mm a')
                      : 'Immediate Broadcast'}
                  </Text>
                </View>
                <View style={styles.infoKeyValue}>
                  <Text style={styles.infoKey}>Auto-Pin Message</Text>
                  <Text style={styles.infoVal}>{targetPost.pin_message ? 'Enabled' : 'Disabled'}</Text>
                </View>
              </View>
            )}

            <View style={styles.cardDivider} />

            {/* Row 3: Formatting & Mode */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleSection('options')}
              style={styles.accordionHeaderRow}
            >
              <View style={styles.accordionTitleWithIcon}>
                <Layers size={16} color={colors.text.secondary} style={styles.rowIcon} />
                <Text style={styles.accordionTitle}>Formatting & Details</Text>
              </View>
              {expandedSections.options ? (
                <ChevronDown size={18} color={colors.text.muted} />
              ) : (
                <ChevronRight size={18} color={colors.text.muted} />
              )}
            </TouchableOpacity>

            {expandedSections.options && (
              <View style={styles.accordionContent}>
                <View style={styles.infoKeyValue}>
                  <Text style={styles.infoKey}>Parser Mode</Text>
                  <Text style={styles.infoVal}>{targetPost.formatting_mode}</Text>
                </View>
                <View style={styles.infoKeyValue}>
                  <Text style={styles.infoKey}>Media Count</Text>
                  <Text style={styles.infoVal}>{mediaList.length} files attached</Text>
                </View>
                <View style={styles.infoKeyValue}>
                  <Text style={styles.infoKey}>Broadcast ID</Text>
                  <Text style={[styles.infoVal, { fontFamily: 'monospace', fontSize: 12 }]}>
                    {targetPost.id.slice(0, 16)}...
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* 7. Sticky Bottom Action Bar (Inspo: [- 1 +] on left, [Add to Cart] on right) */}
        <View style={styles.stickyBottomBar}>
          {/* Secondary Pill on Left (Edit or Delete) */}
          {onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.stepperPill}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={18} color={colors.status.error} />
            </TouchableOpacity>
          )}

          {onEdit && (
            <TouchableOpacity
              onPress={() => {
                handleClose();
                onEdit(targetPost);
              }}
              style={styles.stepperPillSecondary}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Edit3 size={18} color={colors.text.primary} />
            </TouchableOpacity>
          )}

          {/* Primary Action Button on Right (Vibrant CTA) */}
          {targetPost.status === 'SCHEDULED' && onPublishNow ? (
            <TouchableOpacity
              onPress={() => {
                handleClose();
                onPublishNow(targetPost.id);
              }}
              style={styles.primaryActionButton}
            >
              <Zap size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryActionText}>Publish Now</Text>
            </TouchableOpacity>
          ) : targetPost.status === 'SCHEDULED' && onCancelSchedule ? (
            <TouchableOpacity
              onPress={() => {
                handleClose();
                onCancelSchedule(targetPost.id);
              }}
              style={[styles.primaryActionButton, { backgroundColor: colors.status.warning }]}
            >
              <Clock size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryActionText}>Cancel Schedule</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                if (onEdit) {
                  handleClose();
                  onEdit(targetPost);
                } else {
                  handleClose();
                }
              }}
              style={styles.primaryActionButton}
            >
              <Text style={styles.primaryActionText}>
                {targetPost.status === 'PUBLISHED' ? 'Broadcast Dispatched' : 'Edit Broadcast'}
              </Text>
            </TouchableOpacity>
          )}
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
  circleButtonActive: {
    backgroundColor: 'rgba(42, 171, 238, 0.12)',
    borderColor: colors.primary.DEFAULT,
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
  mediaGalleryContainer: {
    width: '100%',
    alignItems: 'center',
  },
  mediaScrollView: {
    width: '100%',
    height: 240,
  },
  mediaSlide: {
    width: Dimensions.get('window').width - 40,
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
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
  textHeroCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textHeroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  channelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(42, 171, 238, 0.10)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  channelChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
  },
  pinnedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(217, 119, 6, 0.10)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pinnedChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.status.warning,
  },
  textHeroSnippet: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: '#1E293B',
    marginBottom: 14,
  },
  textHeroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  textHeroTime: {
    fontSize: 12,
    color: '#64748B',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusTextMini: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
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
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 26,
  },
  statusBadgeBig: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusBadgeBigText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  targetItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  targetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  targetNameCol: {
    flex: 1,
  },
  targetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  targetSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  targetError: {
    fontSize: 11,
    color: colors.status.error,
    marginTop: 2,
  },
  targetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '700',
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
  emptyNotice: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 6,
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
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperPillSecondary: {
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
