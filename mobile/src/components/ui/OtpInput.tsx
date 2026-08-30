import React, { useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 5,
  value,
  onChange,
  error,
  containerStyle,
}) => {
  const inputRef = useRef<TextInput>(null);

  const handleBoxPress = () => {
    inputRef.current?.focus();
  };

  const digits = value.split('');
  const boxes = Array.from({ length }, (_, i) => i);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Hidden real text input handling mobile keyboard */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => {
          const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
          onChange(cleaned);
        }}
        keyboardType="number-pad"
        maxLength={length}
        textContentType="oneTimeCode"
        autoFocus
        style={styles.hiddenInput}
      />

      {/* Visual digit segments */}
      <Pressable onPress={handleBoxPress} style={styles.boxContainer}>
        {boxes.map((index) => {
          const digit = digits[index] || '';
          const isCurrent = index === digits.length;
          const isFilled = Boolean(digit);

          return (
            <View
              key={index}
              style={[
                styles.digitBox,
                isCurrent && styles.activeBox,
                isFilled && styles.filledBox,
                Boolean(error) && styles.errorBox,
              ]}
            >
              <Text style={styles.digitText}>{digit}</Text>
            </View>
          );
        })}
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  digitBox: {
    width: 48,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.input,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBox: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.background.surface,
    transform: [{ scale: 1.04 }],
  },
  filledBox: {
    borderColor: 'rgba(42, 171, 238, 0.4)',
    backgroundColor: colors.background.surface,
  },
  errorBox: {
    borderColor: colors.status.error,
  },
  digitText: {
    ...typography.presets.title1,
    color: colors.text.primary,
    fontWeight: '700',
  },
  errorText: {
    ...typography.presets.caption,
    color: colors.status.error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
