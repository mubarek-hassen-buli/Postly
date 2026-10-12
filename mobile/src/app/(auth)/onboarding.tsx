import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Calendar,
  Check,
  ChevronLeft,
  Layers,
  Radio,
  Send,
  Share2,
  Users,
  Zap,
} from 'lucide-react-native';

import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 4-point sparkle star component matching inspiration design
const SparkleStar = ({ style }: { style: any }) => (
  <View style={[styles.sparkleContainer, style]}>
    <View style={styles.sparkleVertical} />
    <View style={styles.sparkleHorizontal} />
  </View>
);

interface SlideData {
  id: string;
  headlineLine1: string;
  headlineLine2: string;
  description: string;
  buttonLabel: string;
}

const SLIDES_DATA: SlideData[] = [
  {
    id: 'broadcast',
    headlineLine1: 'Perfect Broadcast For',
    headlineLine2: 'All Your Channels',
    description: 'Manage multiple channels, publish media, announcements, and formatted updates in one simple shared place.',
    buttonLabel: 'Next →',
  },
  {
    id: 'scheduling',
    headlineLine1: 'Smart AI Scheduling For',
    headlineLine2: 'Your Content Flow',
    description: 'Queue your broadcasts hours or days ahead. Postly delivers your content automatically with millisecond precision.',
    buttonLabel: 'Next →',
  },
  {
    id: 'reach',
    headlineLine1: 'Stay Connected & Grow',
    headlineLine2: 'Across Telegram & LinkedIn',
    description: 'Cross-publish to Telegram channels and LinkedIn personal feed with a single tap and real-time delivery logs.',
    buttonLabel: 'Get Started →',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList<SlideData>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If session is active, go straight to home
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < SLIDES_DATA.length) {
      setCurrentIndex(index);
      Haptics.selectionAsync().catch(() => {});
    }
  };

  const goToSlide = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
    Haptics.selectionAsync().catch(() => {});
  };

  const handleNext = () => {
    if (currentIndex < SLIDES_DATA.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  };

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push('/(auth)/login');
  };

  const renderHeroGraphic = (index: number) => {
    if (index === 0) {
      // SCREEN 1: Connected Channel Network + Floating "(✓) Channels, Synchronized" Pill
      return (
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#EAF5FD', '#FFF8F2', '#FFFFFF']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />

          <SparkleStar style={{ top: 24, left: 32 }} />
          <SparkleStar style={{ top: 40, right: 36 }} />
          <SparkleStar style={{ bottom: 36, left: 40 }} />
          <SparkleStar style={{ bottom: 50, right: 44 }} />

          {/* Central Visual Hub */}
          <View style={styles.hubContainer}>
            <View style={styles.heroImageFrame}>
              <Image
                source={require('../../../assets/images/onboarding_hero.jpg')}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>

            {/* Orbiting Channel Avatar Bubbles */}
            <View style={[styles.avatarBubble, styles.bubbleTopLeft]}>
              <Send size={18} color="#2AABEE" />
            </View>
            <View style={[styles.avatarBubble, styles.bubbleTopRight]}>
              <Radio size={18} color="#D97706" />
            </View>
            <View style={[styles.avatarBubble, styles.bubbleBottomLeft]}>
              <Share2 size={18} color="#0284C7" />
            </View>
            <View style={[styles.avatarBubble, styles.bubbleBottomRight]}>
              <Zap size={18} color="#16A34A" />
            </View>

            {/* Floating Mini Dark Icon Pills */}
            <View style={[styles.miniDarkPill, styles.miniDarkPillLeft]}>
              <Calendar size={13} color="#FFFFFF" />
            </View>
            <View style={[styles.miniDarkPill, styles.miniDarkPillRight]}>
              <Radio size={13} color="#FFFFFF" />
            </View>
            <View style={[styles.miniDarkPill, styles.miniDarkPillBottom]}>
              <Layers size={13} color="#FFFFFF" />
            </View>

            {/* Center Floating Pill: "(✓) Channels, Synchronized" */}
            <View style={styles.floatingCenterPill}>
              <View style={styles.pillCheckCircle}>
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={styles.floatingPillText}>Channels, Synchronized</Text>
            </View>
          </View>
        </View>
      );
    }

    if (index === 1) {
      // SCREEN 2: Floating Phone Mockup with Task Broadcast Cards
      return (
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#FFF8F0', '#EBF7FD', '#FFFFFF']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />

          <SparkleStar style={{ top: 28, left: 30 }} />
          <SparkleStar style={{ top: 38, right: 34 }} />
          <SparkleStar style={{ bottom: 32, right: 38 }} />

          {/* Floating Phone Frame Mockup */}
          <View style={styles.phoneFrameMockup}>
            {/* Task Card 1 */}
            <View style={styles.mockupTaskCard}>
              <View style={styles.taskCardIconCircle}>
                <Send size={15} color="#2AABEE" />
              </View>
              <View style={styles.taskCardContent}>
                <Text style={styles.taskCardTitle}>Tech Weekly Brief</Text>
                <Text style={styles.taskCardTime}>5:00 PM • Telegram MIT</Text>
              </View>
              <View style={styles.taskCardTagToday}>
                <Text style={styles.taskCardTagTodayText}>Today</Text>
              </View>
            </View>

            {/* Task Card 2 */}
            <View style={[styles.mockupTaskCard, { marginTop: 10 }]}>
              <View style={[styles.taskCardIconCircle, { backgroundColor: 'rgba(217, 119, 6, 0.12)' }]}>
                <Calendar size={15} color="#D97706" />
              </View>
              <View style={styles.taskCardContent}>
                <Text style={styles.taskCardTitle}>Market Digest Alert</Text>
                <Text style={styles.taskCardTime}>Tomorrow 9:30 AM • 4 Ch</Text>
              </View>
              <View style={styles.taskCardTagScheduled}>
                <Text style={styles.taskCardTagScheduledText}>Tomorrow</Text>
              </View>
            </View>

            {/* Checkbox Action Pill */}
            <View style={styles.mockupPinPill}>
              <View style={styles.checkboxCircle}>
                <Check size={10} color="#2AABEE" strokeWidth={3} />
              </View>
              <Text style={styles.mockupPinText}>Auto-pin message to channels</Text>
            </View>
          </View>

          {/* Bottom Floating Connected Channel Bubbles */}
          <View style={styles.bottomBubblesRow}>
            <View style={styles.smallAvatarBubble}>
              <Radio size={13} color="#2AABEE" />
            </View>
            <View style={[styles.smallAvatarBubble, { transform: [{ scale: 1.15 }] }]}>
              <Send size={15} color="#0F172A" />
            </View>
            <View style={styles.smallAvatarBubble}>
              <Share2 size={13} color="#0284C7" />
            </View>
          </View>
        </View>
      );
    }

    // SCREEN 3: 3 Stadium-shaped Vertical Pill Tiles with Badges
    return (
      <View style={styles.heroSection}>
        <LinearGradient
          colors={['#F0F8FE', '#FFF8F2', '#FFFFFF']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        <SparkleStar style={{ top: 22, left: 34 }} />
        <SparkleStar style={{ top: 44, right: 32 }} />
        <SparkleStar style={{ bottom: 28, left: 38 }} />

        {/* Stadium 3-Column Container */}
        <View style={styles.stadiumContainer}>
          {/* Left Stadium Capsule */}
          <View style={[styles.stadiumPill, styles.stadiumPillLeft]}>
            <Image
              source={require('../../../assets/images/onboarding_hero.jpg')}
              style={styles.stadiumImage}
              resizeMode="cover"
            />
          </View>

          {/* Center Stadium Capsule (Taller) */}
          <View style={[styles.stadiumPill, styles.stadiumPillCenter]}>
            <Image
              source={require('../../../assets/images/onboarding_schedule.jpg')}
              style={styles.stadiumImage}
              resizeMode="cover"
            />
            {/* Center junction badge */}
            <View style={styles.stadiumBadgeCenter}>
              <Users size={14} color="#FFFFFF" />
            </View>
          </View>

          {/* Right Stadium Capsule */}
          <View style={[styles.stadiumPill, styles.stadiumPillRight]}>
            <Image
              source={require('../../../assets/images/onboarding_reach.jpg')}
              style={styles.stadiumImage}
              resizeMode="cover"
            />
          </View>

          {/* Dark Icon Badges positioned between capsules */}
          <View style={[styles.stadiumBadgeFloating, { left: 32, top: '48%' }]}>
            <Calendar size={13} color="#FFFFFF" />
          </View>
          <View style={[styles.stadiumBadgeFloating, { right: 32, top: '48%' }]}>
            <Share2 size={13} color="#FFFFFF" />
          </View>
        </View>
      </View>
    );
  };

  const renderSlide = ({ item, index }: { item: SlideData; index: number }) => {
    return (
      <View style={[styles.slideContainer, { width: SCREEN_WIDTH }]}>
        {/* Top Graphic Hero (takes ~58% of screen) */}
        {renderHeroGraphic(index)}

        {/* Bottom Content Area (takes ~42% of screen) */}
        <View style={styles.bottomSection}>
          <View style={styles.textContainer}>
            <Text style={styles.headlineText}>
              {item.headlineLine1}{'\n'}
              <Text style={styles.headlineHighlight}>{item.headlineLine2}</Text>
            </Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>

          {/* Modern Dark Pill Button */}
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.88}
            style={styles.actionPillButton}
            accessibilityRole="button"
            accessibilityLabel={item.buttonLabel}
          >
            <Text style={styles.actionPillText}>{item.buttonLabel}</Text>
          </TouchableOpacity>

          {/* Secondary Sign In Link */}
          <TouchableOpacity
            onPress={handleGetStarted}
            activeOpacity={0.7}
            style={styles.signInLink}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.signInPrompt}>
              Already have an account? <Text style={styles.signInHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Header with Segmented Story Bars & Back Button */}
      <View style={styles.topNavigation}>
        {currentIndex > 0 ? (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backCircleButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Previous slide"
          >
            <ChevronLeft size={18} color="#18181B" strokeWidth={2.4} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        {/* Segmented Progress Bars (Matching Inspiration Image) */}
        <View style={styles.segmentedBarContainer}>
          {SLIDES_DATA.map((_, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = idx < currentIndex;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => goToSlide(idx)}
                style={styles.segmentTouchArea}
                hitSlop={{ top: 10, bottom: 10, left: 2, right: 2 }}
              >
                <View
                  style={[
                    styles.segmentBar,
                    (isActive || isCompleted) && styles.segmentBarActive,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right Skip Button */}
        {currentIndex < SLIDES_DATA.length - 1 ? (
          <TouchableOpacity
            onPress={handleGetStarted}
            style={styles.skipButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Skip onboarding"
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}
      </View>

      {/* Main Horizontal Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES_DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        bounces={false}
        scrollEventThrottle={16}
        style={styles.carouselList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  backCircleButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  backPlaceholder: {
    width: 34,
    height: 34,
  },
  segmentedBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
  },
  segmentTouchArea: {
    flex: 1,
    paddingVertical: 6,
  },
  segmentBar: {
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  segmentBarActive: {
    backgroundColor: '#18181B',
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  skipPlaceholder: {
    width: 42,
    height: 34,
  },
  carouselList: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Hero Section
  heroSection: {
    height: SCREEN_HEIGHT * 0.53,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },

  // Sparkle 4-point stars
  sparkleContainer: {
    position: 'absolute',
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  sparkleVertical: {
    position: 'absolute',
    width: 2.5,
    height: 14,
    borderRadius: 1.25,
    backgroundColor: '#D97706',
    opacity: 0.6,
  },
  sparkleHorizontal: {
    position: 'absolute',
    width: 14,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#D97706',
    opacity: 0.6,
  },

  // Slide 1 Layout
  hubContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroImageFrame: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#2AABEE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  avatarBubble: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  bubbleTopLeft: {
    top: 10,
    left: 10,
  },
  bubbleTopRight: {
    top: 12,
    right: 10,
  },
  bubbleBottomLeft: {
    bottom: 24,
    left: 8,
  },
  bubbleBottomRight: {
    bottom: 24,
    right: 8,
  },
  miniDarkPill: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1E1B18',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  miniDarkPillLeft: {
    left: 0,
    top: '46%',
  },
  miniDarkPillRight: {
    right: 0,
    top: '46%',
  },
  miniDarkPillBottom: {
    bottom: 8,
    alignSelf: 'center',
  },
  floatingCenterPill: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  pillCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181B',
    letterSpacing: -0.2,
  },

  // Slide 2 Layout (Phone Mockup)
  phoneFrameMockup: {
    width: 290,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  mockupTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  taskCardIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(42, 171, 238, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  taskCardContent: {
    flex: 1,
  },
  taskCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  taskCardTime: {
    fontSize: 11,
    color: '#64748B',
  },
  taskCardTagToday: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  taskCardTagTodayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  taskCardTagScheduled: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  taskCardTagScheduledText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  mockupPinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    alignSelf: 'center',
  },
  checkboxCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2AABEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockupPinText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  bottomBubblesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 18,
  },
  smallAvatarBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },

  // Slide 3 Layout (3 Stadium Capsules)
  stadiumContainer: {
    width: 300,
    height: 250,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    position: 'relative',
  },
  stadiumPill: {
    width: 82,
    borderRadius: 44,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stadiumPillLeft: {
    height: 190,
  },
  stadiumPillCenter: {
    height: 230,
    position: 'relative',
  },
  stadiumPillRight: {
    height: 190,
  },
  stadiumImage: {
    width: '100%',
    height: '100%',
  },
  stadiumBadgeCenter: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E1B18',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stadiumBadgeFloating: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E1B18',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },

  // Bottom Content Section
  bottomSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingTop: 10,
  },
  textContainer: {
    alignItems: 'center',
  },
  headlineText: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headlineHighlight: {
    color: '#0F172A',
  },
  descriptionText: {
    fontSize: 14.5,
    lineHeight: 21,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 310,
  },
  actionPillButton: {
    alignSelf: 'center',
    backgroundColor: '#1C1917',
    borderRadius: 30,
    height: 52,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 160,
  },
  actionPillText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  signInLink: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingVertical: 6,
  },
  signInPrompt: {
    fontSize: 13,
    color: '#6B7280',
  },
  signInHighlight: {
    color: colors.primary.DEFAULT,
    fontWeight: '700',
  },
});
