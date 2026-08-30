import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPressRightIcon?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onPressRightIcon,
      containerStyle,
      inputStyle,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const getBorderColor = (): string => {
      if (error) return colors.status.error;
      if (isFocused) return colors.primary.DEFAULT;
      return colors.border.subtle;
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View
          style={[
            styles.inputWrapper,
            { borderColor: getBorderColor() },
            isFocused && styles.focusedWrapper,
            Boolean(error) && styles.errorWrapper,
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            placeholderTextColor={colors.text.muted}
            selectionColor={colors.primary.DEFAULT}
            style={[styles.input, inputStyle]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />
          {rightIcon && (
            <TouchableOpacity
              onPress={onPressRightIcon}
              disabled={!onPressRightIcon}
              style={styles.rightIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.presets.subheadMedium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.input,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    height: 50,
    paddingHorizontal: spacing.md,
  },
  focusedWrapper: {
    backgroundColor: colors.background.surface,
  },
  errorWrapper: {
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    ...typography.presets.body,
    paddingVertical: 0,
    height: '100%',
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  errorText: {
    ...typography.presets.caption,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.presets.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
});
