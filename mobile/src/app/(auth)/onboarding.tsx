import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
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
        {/* Horizontal Swipeable Visuals with all items pre-rendered */}
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
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={3}
          removeClippedSubviews={false}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item }) => (
            <View style={styles.heroSlide}>
              <Image
                source={item.image}
                style={styles.heroImage}
                contentFit="cover"
                priority="high"
                cachePolicy="memory-disk"
                transition={0}
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

          {/* Centered Headline & Description */}
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
    height: SCREEN_HEIGHT * 0.50,
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
    fontFamily: 'Fredoka-Medium',
    color: '#FFFFFF',
    fontSize: 13,
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
    marginTop: -32,
    paddingHorizontal: 24,
    paddingTop: 32,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#0F172A',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#E2E8F0',
  },
  contentArea: {
    marginTop: 8,
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headline: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 34,
    color: '#0F172A',
    lineHeight: 40,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginTop: 14,
    textAlign: 'center',
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  ctaButtonText: {
    fontFamily: 'Fredoka-SemiBold',
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
