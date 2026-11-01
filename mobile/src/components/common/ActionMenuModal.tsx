import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'danger' | 'success';
  disabled?: boolean;
}

export interface ActionMenuSection {
  title?: string;
  items: ActionMenuItem[];
}

export interface ActionMenuModalProps {
  visible: boolean;
  onClose: () => void;
  sections: ActionMenuSection[];
  anchorPosition?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  } | null;
}

const MENU_WIDTH = 216;
const SCREEN_MARGIN = 14;

export const ActionMenuModal: React.FC<ActionMenuModalProps> = ({
  visible,
  onClose,
  sections,
  anchorPosition,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.94);
    }
  }, [visible, fadeAnim, scaleAnim]);

  if (!visible) return null;

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

  // Estimate total menu height to decide whether to flip upward
  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
  const totalHeaders = sections.filter((s) => Boolean(s.title)).length;
  const estimatedHeight = totalItems * 40 + totalHeaders * 24 + 20;

  let top = 100;
  let right = SCREEN_MARGIN;

  if (anchorPosition) {
    const anchorX = anchorPosition.x;
    const anchorY = anchorPosition.y;
    const anchorWidth = anchorPosition.width || 24;
    const anchorHeight = anchorPosition.height || 24;

    // Align right edge of menu with right edge of anchor button
    right = SCREEN_WIDTH - (anchorX + anchorWidth);
    if (right < SCREEN_MARGIN) right = SCREEN_MARGIN;
    if (right + MENU_WIDTH > SCREEN_WIDTH - SCREEN_MARGIN) {
      right = SCREEN_WIDTH - MENU_WIDTH - SCREEN_MARGIN;
    }

    // Check if bottom of menu would overflow screen
    if (anchorY + anchorHeight + estimatedHeight > SCREEN_HEIGHT - 60) {
      // Flip above anchor
      top = Math.max(50, anchorY - estimatedHeight - 4);
    } else {
      // Position below anchor
      top = anchorY + anchorHeight + 4;
    }
  }

  const handleItemPress = (item: ActionMenuItem) => {
    if (item.disabled) return;
    onClose();
    // Allow modal to dismiss cleanly before invoking the action
    setTimeout(() => {
      item.onPress();
    }, 60);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.menuCard,
            {
              top,
              right,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {sections.map((section, sectionIdx) => (
            <View key={`section-${sectionIdx}`}>
              {sectionIdx > 0 && <View style={styles.divider} />}

              {section.title ? (
                <Text style={styles.sectionHeader}>{section.title}</Text>
              ) : null}

              {section.items.map((item) => {
                const isDanger = item.variant === 'danger';
                const isPrimary = item.variant === 'primary';

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleItemPress(item)}
                    disabled={item.disabled}
                    style={[
                      styles.menuItem,
                      item.disabled && styles.menuItemDisabled,
                    ]}
                    activeOpacity={0.65}
                  >
                    {item.icon ? (
                      <View style={styles.iconContainer}>{item.icon}</View>
                    ) : null}

                    <Text
                      style={[
                        styles.itemLabel,
                        isDanger && styles.itemLabelDanger,
                        isPrimary && styles.itemLabelPrimary,
                        item.disabled && styles.itemLabelDisabled,
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    zIndex: 9999,
  },
  menuCard: {
    position: 'absolute',
    width: MENU_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    // Elevated Drop Shadow
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
    marginHorizontal: 4,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  menuItemDisabled: {
    opacity: 0.4,
  },
  iconContainer: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemLabel: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#1E293B',
    letterSpacing: -0.1,
  },
  itemLabelDanger: {
    color: '#E11D48',
    fontWeight: '500',
  },
  itemLabelPrimary: {
    color: '#0D9488',
    fontWeight: '500',
  },
  itemLabelDisabled: {
    color: '#94A3B8',
  },
});
