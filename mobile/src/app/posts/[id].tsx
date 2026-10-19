import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  FileText,
  Layers,
  MessageSquare,
  Radio,
  Send,
  Share2,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import {
  useCancelScheduledPost,
  useDeletePost,
  usePost,
  usePublishPostNow,
} from '../../hooks/usePosts';
import { PostChannelTargetItem, PostItem } from '../../services/posts/postService';
import { ScreenHeaderBanner, CurvedSheet } from '../../components/common/ScreenHeaderBanner';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, layout, spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH - 40;
const CAROUSEL_HEIGHT = 260;

export default function PostDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const postId = Array.isArray(id) ? id[0] : id;
  const { data: post, isLoading, isError, refetch } = usePost(postId ?? null);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('ALL');
  const [expandedSection, setExpandedSection] = useState<string | null>('delivery');
  const [copied, setCopied] = useState(false);

  const publishMutation = usePublishPostNow();
  const cancelMutation = useCancelScheduledPost();
  const deleteMutation = useDeletePost();

  const handleCopyContent = () => {
    if (!post?.content) return;
    Haptics.selectionAsync().catch(() => {});
    Clipboard.setString(post.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishNow = async () => {
    if (!postId) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await publishMutation.mutateAsync(postId);
      Alert.alert('Broadcast Sent', 'Your post has been published to targeted channels.');
      refetch();
    } catch (err: any) {
      Alert.alert('Publish Failed', err?.message || 'Could not publish post immediately.');
    }
  };

  const handleCancelSchedule = async () => {
    if (!postId) return;
    Alert.alert(
      'Cancel Scheduled Broadcast',
      'Are you sure you want to stop this broadcast? It will be converted back to a draft.',
      [
        { text: 'Keep Scheduled', style: 'cancel' },
        {
          text: 'Cancel Broadcast',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
              await cancelMutation.mutateAsync(postId);
              refetch();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to cancel schedule.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    if (!postId) return;
    Alert.alert(
      'Delete Post',
      'This action cannot be undone. Are you sure you want to remove this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              await deleteMutation.mutateAsync(postId);
              router.back();
            } catch (err: any) {
              Alert.alert('Delete Failed', err?.message || 'Could not delete post.');
            }
          },
        },
      ]
    );
  };

  const toggleSection = (sectionKey: string) => {
    Haptics.selectionAsync().catch(() => {});
    setExpandedSection((prev) => (prev === sectionKey ? null : sectionKey));
  };

  const getStatusBadge = (status: PostItem['status']) => {
    switch (status) {
      case 'PUBLISHED':
        return {
          label: 'PUBLISHED',
          bg: 'rgba(52, 199, 89, 0.12)',
          text: '#28A745',
          border: 'rgba(52, 199, 89, 0.25)',
        };
      case 'SCHEDULED':
        return {
          label: 'SCHEDULED',
          bg: 'rgba(0, 136, 204, 0.12)',
          text: '#0088CC',
          border: 'rgba(0, 136, 204, 0.25)',
        };
      case 'FAILED':
        return {
          label: 'FAILED',
          bg: 'rgba(255, 59, 48, 0.12)',
          text: '#FF3B30',
          border: 'rgba(255, 59, 48, 0.25)',
        };
      default:
        return {
          label: 'DRAFT',
          bg: 'rgba(100, 116, 139, 0.12)',
          text: '#64748B',
          border: 'rgba(100, 116, 139, 0.25)',
        };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeaderBanner
          compact={true}
          showBackButton={true}
          title="Post Details"
        />
        <CurvedSheet>
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Text style={styles.centerMessage}>Loading post...</Text>
          </View>
        </CurvedSheet>
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View style={styles.container}>
        <ScreenHeaderBanner
          compact={true}
          showBackButton={true}
          title="Post Details"
        />
        <CurvedSheet>
          <View style={styles.centerBox}>
            <AlertCircle size={44} color={colors.status.error} />
            <Text style={styles.errorTitle}>Post Not Found</Text>
            <Text style={styles.centerMessage}>This post could not be loaded or was removed.</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </CurvedSheet>
      </View>
    );
  }

  const badge = getStatusBadge(post.status);
  const mediaList = post.media_attachments || [];
  const targets = post.targets || [];

  // Filtered targets for the variant channel chips
  const displayedTargets =
    selectedChannelFilter === 'ALL'
      ? targets
      : targets.filter(
          (t) =>
            t.channel_id === selectedChannelFilter ||
            t.channel_title?.toLowerCase() === selectedChannelFilter.toLowerCase()
        );

  const formattedDate = post.scheduled_for
    ? format(new Date(post.scheduled_for), 'MMM d, yyyy • h:mm a')
    : post.published_at
    ? format(new Date(post.published_at), 'MMM d, yyyy • h:mm a')
    : format(new Date(post.created_at), 'MMM d, yyyy • h:mm a');

  // Extract a clean heading from post content or default
  const titleExcerpt =
    post.content?.split('\n')[0]?.slice(0, 60) || 'Broadcast Message';

  return (
    <View style={styles.container}>
      {/* 1. Signature Header Banner with Frosted Nav Actions */}
      <ScreenHeaderBanner
        compact={true}
        showBackButton={true}
        title="Post Details"
        rightActions={
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.frostedRightButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Delete post"
          >
            <Trash2 size={18} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {/* 2. Main Sheet matching The Ordinary inspiration */}
      <CurvedSheet>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 90, 110) },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              tintColor={colors.primary.DEFAULT}
            />
          }
        >
          {/* A. Hero Media Showcase / Canvas */}
          {mediaList.length > 0 ? (
            <View style={styles.mediaContainer}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const x = e.nativeEvent.contentOffset.x;
                  const idx = Math.round(x / CAROUSEL_WIDTH);
                  if (idx !== activeMediaIndex) setActiveMediaIndex(idx);
                }}
                scrollEventThrottle={16}
                style={styles.carouselScrollView}
              >
                {mediaList.map((media, idx) => (
                  <View key={media.id || idx} style={styles.mediaSlide}>
                    <Image
                      source={{ uri: media.media_url }}
                      style={styles.mediaImage}
                      contentFit="cover"
                      transition={250}
                    />
                  </View>
                ))}
              </ScrollView>

              {/* Pill Pagination Indicator matching reference (- • • •) */}
              {mediaList.length > 1 && (
                <View style={styles.paginationRow}>
                  {mediaList.map((_, idx) => {
                    const isActive = idx === activeMediaIndex;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.paginationDot,
                          isActive && styles.paginationDotActive,
                        ]}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          ) : (
            /* Aesthetic Preview Canvas when post has no media */
            <View style={styles.textOnlyHeroCanvas}>
              <View style={styles.heroWatermarkIcon}>
                <Radio size={72} color="rgba(0, 136, 204, 0.08)" />
              </View>
              <View style={styles.heroQuoteBadge}>
                <MessageSquare size={16} color={colors.primary.DEFAULT} />
                <Text style={styles.heroQuoteBadgeText}>Broadcast Preview</Text>
              </View>
              <Text style={styles.heroQuoteText} numberOfLines={3}>
                "{post.content?.trim() || 'No message content'}"
              </Text>
            </View>
          )}

          {/* B. Title, Status & Meta Row (Unboxed Hierarchy) */}
          <View style={styles.titleSection}>
            <Text style={styles.categoryLabel}>
              {post.status === 'PUBLISHED'
                ? 'PUBLISHED BROADCAST'
                : post.status === 'SCHEDULED'
                ? 'SCHEDULED BROADCAST'
                : 'DRAFT BROADCAST'}
            </Text>

            <View style={styles.headlineAndPriceRow}>
              <Text style={styles.postHeadline} numberOfLines={2}>
                {titleExcerpt}
              </Text>

              {/* Status Pill in the "$6.50" Price Spot */}
              <View
                style={[
                  styles.statusBadgeCapsule,
                  { backgroundColor: badge.bg, borderColor: badge.border },
                ]}
              >
                <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                  {badge.label}
                </Text>
              </View>
            </View>

            {/* Rating / Meta equivalent row */}
            <View style={styles.metaRow}>
              <Zap size={14} color="#0088CC" />
              <Text style={styles.metaText}>
                {targets.length} Target Channel{targets.length !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.metaDivider}>•</Text>
              <Clock size={13} color="#64748B" />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
          </View>

          {/* C. Channel Variant Pills (Matching 30ml, 100ml, 150ml) */}
          {targets.length > 0 && (
            <View style={styles.channelPillsSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsScrollContent}
              >
                <TouchableOpacity
                  onPress={() => setSelectedChannelFilter('ALL')}
                  style={[
                    styles.channelPill,
                    selectedChannelFilter === 'ALL' && styles.channelPillActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.channelPillText,
                      selectedChannelFilter === 'ALL' && styles.channelPillTextActive,
                    ]}
                  >
                    All Channels ({targets.length})
                  </Text>
                </TouchableOpacity>

                {targets.map((t, index) => {
                  const isSelected = selectedChannelFilter === t.channel_id;
                  return (
                    <TouchableOpacity
                      key={t.channel_id || t.id || index}
                      onPress={() => setSelectedChannelFilter(t.channel_id || t.id)}
                      style={[
                        styles.channelPill,
                        isSelected && styles.channelPillActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.channelPillText,
                          isSelected && styles.channelPillTextActive,
                        ]}
                      >
                        {t.channel_title || `Channel ${index + 1}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* D. Unboxed Message Content */}
          <View style={styles.contentSection}>
            <View style={styles.contentHeaderRow}>
              <Text style={styles.contentSectionTitle}>Message Text</Text>
              <TouchableOpacity
                onPress={handleCopyContent}
                style={styles.copyInlineButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {copied ? (
                  <>
                    <Check size={14} color="#28A745" />
                    <Text style={[styles.copyInlineText, { color: '#28A745' }]}>
                      Copied!
                    </Text>
                  </>
                ) : (
                  <>
                    <Copy size={14} color="#0088CC" />
                    <Text style={styles.copyInlineText}>Copy</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.postBodyText} selectable={true}>
              {post.content || 'No text content in this broadcast.'}
            </Text>
          </View>

          {/* E. Grouped Accordion Rows (Description ->, Ingredients ->, How to use ->) */}
          <View style={styles.accordionCard}>
            {/* 1. Delivery & Channel Logs */}
            <TouchableOpacity
              onPress={() => toggleSection('delivery')}
              style={styles.accordionHeader}
              activeOpacity={0.7}
            >
              <View style={styles.accordionTitleRow}>
                <Radio size={18} color="#0088CC" />
                <Text style={styles.accordionTitle}>Delivery & Channel Logs</Text>
              </View>
              {expandedSection === 'delivery' ? (
                <ChevronDown size={18} color="#94A3B8" />
              ) : (
                <ChevronRight size={18} color="#94A3B8" />
              )}
            </TouchableOpacity>

            {expandedSection === 'delivery' && (
              <View style={styles.accordionBody}>
                {displayedTargets.length === 0 ? (
                  <Text style={styles.emptyAccordionText}>
                    No target channels found for this selection.
                  </Text>
                ) : (
                  displayedTargets.map((target, idx) => {
                    const isSuccess = target.status === 'SUCCESS';
                    const isFailed = target.status === 'FAILED';
                    return (
                      <View key={target.channel_id || target.id || idx} style={styles.targetRow}>
                        <View style={styles.targetLeft}>
                          <View
                            style={[
                              styles.targetStatusDot,
                              isSuccess && { backgroundColor: '#34C759' },
                              isFailed && { backgroundColor: '#FF3B30' },
                            ]}
                          />
                          <View>
                            <Text style={styles.targetChannelTitle}>
                              {target.channel_title || 'Target Channel'}
                            </Text>
                            {target.error_message ? (
                              <Text style={styles.targetErrorText} numberOfLines={2}>
                                {target.error_message}
                              </Text>
                            ) : (
                              <Text style={styles.targetSubText}>
                                {isSuccess
                                  ? 'Delivered to Telegram'
                                  : target.status === 'PENDING'
                                  ? 'Pending dispatch'
                                  : 'Queued'}
                              </Text>
                            )}
                          </View>
                        </View>

                        <View
                          style={[
                            styles.targetStatusBadge,
                            isSuccess && styles.targetBadgeSuccess,
                            isFailed && styles.targetBadgeFailed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.targetStatusBadgeText,
                              isSuccess && { color: '#34C759' },
                              isFailed && { color: '#FF3B30' },
                            ]}
                          >
                            {target.status}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            <View style={styles.accordionDivider} />

            {/* 2. Schedule & Timing */}
            <TouchableOpacity
              onPress={() => toggleSection('schedule')}
              style={styles.accordionHeader}
              activeOpacity={0.7}
            >
              <View style={styles.accordionTitleRow}>
                <Clock size={18} color="#0088CC" />
                <Text style={styles.accordionTitle}>Schedule & Timing</Text>
              </View>
              {expandedSection === 'schedule' ? (
                <ChevronDown size={18} color="#94A3B8" />
              ) : (
                <ChevronRight size={18} color="#94A3B8" />
              )}
            </TouchableOpacity>

            {expandedSection === 'schedule' && (
              <View style={styles.accordionBody}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Created At</Text>
                  <Text style={styles.infoVal}>
                    {format(new Date(post.created_at), 'PPP • p')}
                  </Text>
                </View>
                {post.scheduled_for && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Scheduled For</Text>
                    <Text style={styles.infoVal}>
                      {format(new Date(post.scheduled_for), 'PPP • p')}
                    </Text>
                  </View>
                )}
                {post.published_at && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Published At</Text>
                    <Text style={styles.infoVal}>
                      {format(new Date(post.published_at), 'PPP • p')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.accordionDivider} />

            {/* 3. Media & Attachments Info */}
            <TouchableOpacity
              onPress={() => toggleSection('media')}
              style={styles.accordionHeader}
              activeOpacity={0.7}
            >
              <View style={styles.accordionTitleRow}>
                <Layers size={18} color="#0088CC" />
                <Text style={styles.accordionTitle}>
                  Media Attachments ({mediaList.length})
                </Text>
              </View>
              {expandedSection === 'media' ? (
                <ChevronDown size={18} color="#94A3B8" />
              ) : (
                <ChevronRight size={18} color="#94A3B8" />
              )}
            </TouchableOpacity>

            {expandedSection === 'media' && (
              <View style={styles.accordionBody}>
                {mediaList.length === 0 ? (
                  <Text style={styles.emptyAccordionText}>
                    No media files attached to this broadcast.
                  </Text>
                ) : (
                  mediaList.map((item, idx) => (
                    <View key={item.id || idx} style={styles.mediaInfoItem}>
                      <FileText size={16} color="#64748B" />
                      <Text style={styles.mediaInfoText} numberOfLines={1}>
                        File #{idx + 1} ({item.media_type || 'image'})
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* F. Sticky Floating Bottom Action Bar (Matching "- 1 +" & "Add to Cart") */}
        <View
          style={[
            styles.bottomStickyBar,
            { paddingBottom: Math.max(insets.bottom + 8, 16) },
          ]}
        >
          {/* Secondary Action Pill */}
          <TouchableOpacity
            onPress={handleCopyContent}
            style={styles.bottomSecondaryButton}
            activeOpacity={0.8}
            accessibilityLabel="Copy post content"
          >
            <Copy size={18} color="#0F172A" />
            <Text style={styles.bottomSecondaryText}>Copy</Text>
          </TouchableOpacity>

          {/* Primary Action Button */}
          {post.status === 'SCHEDULED' ? (
            <TouchableOpacity
              onPress={handlePublishNow}
              disabled={publishMutation.isPending}
              style={[
                styles.bottomPrimaryButton,
                publishMutation.isPending && styles.buttonDisabled,
              ]}
              activeOpacity={0.8}
            >
              {publishMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Send size={18} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.bottomPrimaryText}>Publish Now</Text>
                </>
              )}
            </TouchableOpacity>
          ) : post.status === 'DRAFT' ? (
            <TouchableOpacity
              onPress={handlePublishNow}
              disabled={publishMutation.isPending}
              style={[
                styles.bottomPrimaryButton,
                publishMutation.isPending && styles.buttonDisabled,
              ]}
              activeOpacity={0.8}
            >
              {publishMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Send size={18} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.bottomPrimaryText}>Broadcast Now</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/compose')}
              style={styles.bottomPrimaryButton}
              activeOpacity={0.8}
            >
              <Zap size={18} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.bottomPrimaryText}>Compose New</Text>
            </TouchableOpacity>
          )}
        </View>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  centerMessage: {
    ...typography.presets.body,
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
  },
  errorTitle: {
    ...typography.presets.title2,
    color: '#0F172A',
    marginTop: 12,
  },
  retryButton: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0088CC',
    borderRadius: 12,
  },
  retryButtonText: {
    ...typography.presets.button,
    color: '#FFFFFF',
  },

  /* Media Carousel */
  mediaContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  carouselScrollView: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#EDF2F7',
  },
  mediaSlide: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  paginationDotActive: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0088CC',
  },

  /* No-Media Canvas */
  textOnlyHeroCanvas: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  heroWatermarkIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  heroQuoteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  heroQuoteBadgeText: {
    ...typography.presets.caption,
    fontFamily: 'Fredoka-SemiBold',
    color: '#0088CC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroQuoteText: {
    ...typography.presets.body,
    color: '#475569',
    fontSize: 16,
    lineHeight: 23,
    fontStyle: 'italic',
  },

  /* Title, Status, Price */
  titleSection: {
    marginBottom: 18,
  },
  categoryLabel: {
    ...typography.presets.caption,
    fontFamily: 'Fredoka-SemiBold',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  headlineAndPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  postHeadline: {
    ...typography.presets.title2,
    color: '#0F172A',
    fontSize: 22,
    lineHeight: 28,
    flex: 1,
  },
  statusBadgeCapsule: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    ...typography.presets.caption,
    fontFamily: 'Fredoka-Bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  metaText: {
    ...typography.presets.subhead,
    color: '#64748B',
    fontSize: 13,
  },
  metaDivider: {
    color: '#CBD5E1',
    marginHorizontal: 2,
  },

  /* Channel Variant Pills (30ml, 100ml) */
  channelPillsSection: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  pillsScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  channelPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  channelPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  channelPillText: {
    ...typography.presets.subheadMedium,
    color: '#475569',
    fontSize: 13,
  },
  channelPillTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Fredoka-SemiBold',
  },

  /* Unboxed Post Body */
  contentSection: {
    marginBottom: 22,
  },
  contentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contentSectionTitle: {
    ...typography.presets.title3,
    color: '#0F172A',
    fontSize: 16,
  },
  copyInlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyInlineText: {
    ...typography.presets.caption,
    fontFamily: 'Fredoka-SemiBold',
    color: '#0088CC',
  },
  postBodyText: {
    ...typography.presets.body,
    color: '#334155',
    fontSize: 15,
    lineHeight: 23,
  },

  /* Grouped Accordion Rows */
  accordionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accordionTitle: {
    ...typography.presets.bodyMedium,
    color: '#1E293B',
    fontSize: 15,
  },
  accordionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  accordionBody: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  emptyAccordionText: {
    ...typography.presets.subhead,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  targetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  targetStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  targetChannelTitle: {
    ...typography.presets.bodyMedium,
    color: '#0F172A',
    fontSize: 14,
  },
  targetSubText: {
    ...typography.presets.caption,
    color: '#64748B',
  },
  targetErrorText: {
    ...typography.presets.caption,
    color: '#FF3B30',
  },
  targetStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  targetBadgeSuccess: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },
  targetBadgeFailed: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
  },
  targetStatusBadgeText: {
    ...typography.presets.caption,
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoKey: {
    ...typography.presets.subhead,
    color: '#64748B',
  },
  infoVal: {
    ...typography.presets.subheadMedium,
    color: '#0F172A',
  },
  mediaInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  mediaInfoText: {
    ...typography.presets.subhead,
    color: '#334155',
  },

  /* Sticky Bottom Bar */
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 12,
  },
  bottomSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 18,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
  },
  bottomSecondaryText: {
    ...typography.presets.button,
    color: '#0F172A',
    fontSize: 14,
  },
  bottomPrimaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0088CC',
    shadowColor: '#0088CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomPrimaryText: {
    ...typography.presets.button,
    color: '#FFFFFF',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
