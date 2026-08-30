import React from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  bordered = true,
  style,
  ...rest
}) => {
  return (
    <View
      style={[
        styles.base,
        elevated ? styles.elevated : styles.surface,
        bordered && styles.bordered,
        elevated && shadows.medium,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  surface: {
    backgroundColor: colors.background.surface,
  },
  elevated: {
    backgroundColor: colors.background.elevated,
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
});
