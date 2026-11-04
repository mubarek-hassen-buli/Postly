import React, { useEffect } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonLabel?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  title = 'Successful',
  message = 'Your broadcast has been successfully created.',
  buttonLabel = 'Done',
}) => {
  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Brand Scalloped Rosette Badge */}
          <View style={styles.badgeWrapper}>
            <View style={styles.badgeOuterGlow} />
            <View style={[styles.rosettePetal, { transform: [{ rotate: '0deg' }] }]} />
            <View style={[styles.rosettePetal, { transform: [{ rotate: '45deg' }] }]} />
            <View style={styles.checkContainer}>
              <Check size={32} color={colors.primary.dark} strokeWidth={3.5} />
            </View>
          </View>

          {/* Heading */}
          <Text style={styles.title}>{title}</Text>

          {/* Message description */}
          <Text style={styles.message}>{message}</Text>

          {/* Done CTA Button */}
          <TouchableOpacity
            style={styles.doneButton}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.doneButtonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.background.surface,
    borderRadius: 28,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 14,
  },
  badgeWrapper: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  badgeOuterGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary.subtle,
  },
  rosettePetal: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 18,
    backgroundColor: 'rgba(42, 171, 238, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(42, 171, 238, 0.35)',
  },
  checkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: 24,
    lineHeight: 30,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    fontFamily: typography.fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xxl,
  },
  doneButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  doneButtonText: {
    fontFamily: typography.fonts.displaySemiBold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

