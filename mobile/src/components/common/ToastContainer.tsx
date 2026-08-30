import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
} from 'lucide-react-native';
import { useToastStore, ToastMessage } from '../../store/useToastStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

export const ToastContainer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { toasts, hideToast } = useToastStore();

  if (toasts.length === 0) return null;

  const renderIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} color={colors.status.success} />;
      case 'error':
        return <AlertCircle size={18} color={colors.status.error} />;
      case 'warning':
        return <AlertTriangle size={18} color={colors.status.warning} />;
      default:
        return <Info size={18} color={colors.status.info} />;
    }
  };

  const getBorderColor = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return colors.status.successBorder;
      case 'error':
        return colors.status.errorBorder;
      case 'warning':
        return colors.status.warningBorder;
      default:
        return colors.status.infoBorder;
    }
  };

  return (
    <View style={[styles.container, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
      {toasts.map((toast) => (
        <Pressable
          key={toast.id}
          onPress={() => hideToast(toast.id)}
          style={[styles.toastCard, { borderColor: getBorderColor(toast.type) }]}
        >
          <View style={styles.iconWrapper}>{renderIcon(toast.type)}</View>
          <View style={styles.textWrapper}>
            <Text style={styles.title}>{toast.title}</Text>
            {toast.message && <Text style={styles.message}>{toast.message}</Text>}
          </View>
          <Pressable onPress={() => hideToast(toast.id)} style={styles.closeBtn}>
            <X size={14} color={colors.text.muted} />
          </Pressable>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    gap: spacing.xs,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    ...shadows.medium,
  },
  iconWrapper: {
    marginRight: spacing.sm,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    ...typography.presets.subheadMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  message: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});
