import React from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import {
  FileText,
  LayoutDashboard,
  Plus,
  Radio,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useDetailModalStore } from '../../store/useDetailModalStore';

export type FloatingTabBarProps = BottomTabBarProps;

interface TabConfig {
  name: string;
  label: string;
  icon: (color: string) => React.ReactNode;
}

const NAV_TABS: TabConfig[] = [
  {
    name: 'index',
    label: 'Dashboard',
    icon: (color) => <LayoutDashboard size={18} color={color} strokeWidth={2.2} />,
  },
  {
    name: 'posts',
    label: 'Posters',
    icon: (color) => <FileText size={18} color={color} strokeWidth={2.2} />,
  },
  {
    name: 'channels',
    label: 'Channels',
    icon: (color) => <Radio size={18} color={color} strokeWidth={2.2} />,
  },
  {
    name: 'settings',
    label: 'Settings',
    icon: (color) => <SettingsIcon size={18} color={color} strokeWidth={2.2} />,
  },
];

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  state,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isDetailModalOpen = useDetailModalStore((s) => s.isDetailModalOpen);

  // Active route name
  const currentRouteName = state.routes[state.index]?.name || 'index';

  if (isDetailModalOpen) {
    return null;
  }

  const handleTabPress = (routeName: string, routeKey: string) => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: routeKey,
      canPreventDefault: true,
    });

    if (currentRouteName !== routeName && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const handleComposePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push('/compose');
  };

  return (
    <View
      style={[
        styles.overlayContainer,
        { bottom: Math.max(insets.bottom, 16) },
      ]}
      pointerEvents="box-none"
    >
      {/* 1. Left Dark Pill Capsule (Navigation Tabs) */}
      <View style={styles.pillCapsule}>
        {NAV_TABS.map((tab) => {
          const isActive = currentRouteName === tab.name;
          const matchingRoute = state.routes.find((r) => r.name === tab.name);
          const routeKey = matchingRoute?.key || tab.name;

          if (isActive) {
            return (
              <TouchableOpacity
                key={tab.name}
                activeOpacity={0.85}
                onPress={() => handleTabPress(tab.name, routeKey)}
                style={styles.activePill}
              >
                {tab.icon('#FFFFFF')}
                <Text style={styles.activeLabel}>{tab.label}</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.name}
              activeOpacity={0.7}
              onPress={() => handleTabPress(tab.name, routeKey)}
              style={styles.inactiveTab}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            >
              {tab.icon('#8E95A4')}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. Right Standalone Circular Action Button (Compose) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleComposePress}
        style={styles.actionCircle}
        accessibilityRole="button"
        accessibilityLabel="Create post"
      >
        <Plus size={26} color="#FFFFFF" strokeWidth={2.6} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 999,
  },
  pillCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12151B',
    borderRadius: 36,
    padding: 6,
    gap: 4,
    // Outer shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#272C35',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 28,
    gap: 6,
  },
  activeLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  inactiveTab: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  actionCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0088CC',
    alignItems: 'center',
    justifyContent: 'center',
    // Postly Signature Cyan/Blue Glow
    ...Platform.select({
      ios: {
        shadowColor: '#0088CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
