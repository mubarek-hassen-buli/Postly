import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import {
  FileText,
  Plus,
  Radio,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export type FloatingTabBarProps = BottomTabBarProps;

interface TabConfig {
  name: string;
  label: string;
  icon: (color: string) => React.ReactNode;
}

const NAV_TABS: TabConfig[] = [
  {
    name: 'index',
    label: 'Posts',
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

  // Active route name
  const currentRouteName = state.routes[state.index]?.name || 'index';

  const handleTabPress = (routeName: string, routeKey: string) => {
    Haptics.selectionAsync().catch(() => {});

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
        <Plus size={26} color="#12151B" strokeWidth={2.6} />
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 28,
    gap: 8,
  },
  activeLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  inactiveTab: {
    width: 44,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  actionCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFB765',
    alignItems: 'center',
    justifyContent: 'center',
    // Golden glow shadow
    ...Platform.select({
      ios: {
        shadowColor: '#FFB765',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
