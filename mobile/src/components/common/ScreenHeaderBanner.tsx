import React, { ReactNode } from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { typography } from '../../theme/typography';

export interface ScreenHeaderBannerProps {
  title?: string | ReactNode;
  subtitle?: string | null;
  badge?: string | number | null;
  leftAction?: ReactNode;
  rightActions?: ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  compact?: boolean;
  children?: ReactNode;
  style?: ViewStyle;
}

export const ScreenHeaderBanner: React.FC<ScreenHeaderBannerProps> = ({
  title,
  subtitle,
  badge,
  leftAction,
  rightActions,
  showBackButton = false,
  onBackPress,
  compact = false,
  children,
  style,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <LinearGradient
        colors={['#0077B6', '#0096C7', '#2AABEE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradientBanner,
          compact ? styles.compactBanner : styles.standardBanner,
          { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 24 : 16) + 8 },
          style,
        ]}
      >
        {/* Subtle geometric concentric pattern overlay matching Auth screens */}
        <View style={styles.bannerPatternLayer} pointerEvents="none">
          <View style={styles.patternCircleLarge} />
          <View style={styles.patternCircleMedium} />
          <View style={styles.patternCircleSmall} />
        </View>

        {/* Top Action Row */}
        <View style={styles.navRow}>
          <View style={styles.navLeft}>
            {showBackButton ? (
              <TouchableOpacity
                onPress={handleBack}
                style={styles.frostedIconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Go back"
                accessibilityRole="button"
              >
                <ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.4} />
              </TouchableOpacity>
            ) : (
              leftAction
            )}

            {compact && typeof title === 'string' && (
              <Text style={styles.compactTitleText} numberOfLines={1}>
                {title}
              </Text>
            )}
          </View>

          {rightActions && <View style={styles.navRight}>{rightActions}</View>}
        </View>

        {/* Standard Content Row (for Tabs and Non-compact headers) */}
        {!compact && (
          <View style={styles.standardContentRow}>
            <View style={styles.titleColumn}>
              {typeof title === 'string' ? (
                <View style={styles.titleWithBadgeRow}>
                  <Text style={styles.standardTitleText}>{title}</Text>
                  {badge !== undefined && badge !== null && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                  )}
                </View>
              ) : (
                title
              )}

              {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
            </View>
          </View>
        )}

        {/* Optional Extra Custom Content (e.g. Profile banner in Settings) */}
        {children}
      </LinearGradient>
    </View>
  );
};

export interface CurvedSheetProps {
  children: ReactNode;
  style?: ViewStyle;
}

/**
 * CurvedSheet wraps content below the ScreenHeaderBanner with the signature
 * high curved top borders, shadow elevation, and neutral base background.
 */
export const CurvedSheet: React.FC<CurvedSheetProps> = ({ children, style }) => {
  return <View style={[styles.curvedSheet, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#0077B6',
    zIndex: 1,
  },
  gradientBanner: {
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  standardBanner: {
    paddingBottom: 42,
  },
  compactBanner: {
    paddingBottom: 36,
  },
  bannerPatternLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.16,
  },
  patternCircleLarge: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  patternCircleMedium: {
    position: 'absolute',
    top: 15,
    right: 70,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  patternCircleSmall: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  frostedIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTitleText: {
    ...typography.presets.title2,
    color: '#FFFFFF',
    fontSize: 19,
    flex: 1,
  },
  standardContentRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleColumn: {
    flex: 1,
  },
  titleWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  standardTitleText: {
    ...typography.presets.hero,
    fontSize: 28,
    lineHeight: 34,
    color: '#FFFFFF',
  },
  badgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  badgeText: {
    ...typography.presets.caption,
    fontFamily: 'Fredoka-SemiBold',
    color: '#FFFFFF',
    fontSize: 12,
  },
  subtitleText: {
    ...typography.presets.subhead,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  curvedSheet: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -26,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'hidden',
  },
});
