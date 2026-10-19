import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SlideData {
  id: string;
  image: any;
  headline: string;
  description: string;
  buttonLabel: string;
}

const SLIDES_DATA: SlideData[] = [
  {
    id: 'accounts',
    image: require('../../../assets/images/onboarding-1.png'),
    headline: 'Connect your Accounts',
    description: 'Link your social media accounts and start posting in seconds',
    buttonLabel: 'Continue',
  },
  {
    id: 'create',
    image: require('../../../assets/images/onboarding-2.png'),
    headline: 'Create and Post',
    description: 'Write your message, add media, and post to all your channels from one place',
    buttonLabel: 'Continue',
  },
  {
    id: 'growth',
    image: require('../../../assets/images/onboarding-3.png'),
    headline: 'Track your Growth',
    description: 'See your performance, get insights and grow your presence over time',
    buttonLabel: 'Start exploring',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    }
  };

  const goToSlide = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const handleButtonPress = () => {
    if (currentIndex < SLIDES_DATA.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/login');
  };

  const currentSlide = SLIDES_DATA[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Upper Part: Image taking upper part edge-to-edge */}
      <View style={styles.topCanvas}>
        {/* Horizontal Swipeable Visuals */}
        <FlatList
          ref={flatListRef}
          data={SLIDES_DATA}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          bounces={false}
          renderItem={({ item }) => (
            <View style={styles.heroSlide}>
              <Image
                source={item.image}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>
          )}
          style={styles.heroFlatList}
        />

        {/* Top Header Row with Skip Button */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top + 8, 20) }]}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <View style={styles.skipPill}>
              <Text style={styles.skipText}>Skip</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Section: White Card matching inspiration */}
      <View style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom + 16, 28) }]}>
        <View>
          {/* Centered Pagination Dots */}
          <View style={styles.paginationRow}>
            {SLIDES_DATA.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => goToSlide(i)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.dot,
                    currentIndex === i ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Headline & Description matching inspiration typography */}
          <View style={styles.contentArea}>
            <Text style={styles.headline}>
              {currentSlide.headline}
            </Text>

            <Text style={styles.description}>
              {currentSlide.description}
            </Text>
          </View>
        </View>

        {/* Bottom CTA Pill Button */}
        <TouchableOpacity
          onPress={handleButtonPress}
          style={styles.ctaButton}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>{currentSlide.buttonLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topCanvas: {
    height: SCREEN_HEIGHT * 0.56,
    width: SCREEN_WIDTH,
    position: 'relative',
    backgroundColor: '#5CB9FC',
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  skipButton: {
    paddingVertical: 4,
  },
  skipPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  heroFlatList: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  heroSlide: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -24,
    paddingHorizontal: 28,
    paddingTop: 24,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: '#0F172A',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#E2E8F0',
  },
  contentArea: {
    marginBottom: 16,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    marginTop: 10,
  },
  ctaButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
