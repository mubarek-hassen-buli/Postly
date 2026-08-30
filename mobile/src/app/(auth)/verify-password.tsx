import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, KeyRound, ShieldAlert } from 'lucide-react-native';

import { passwordSchema, PasswordFormValues } from '../../schemas/authSchemas';
import { authService } from '../../services/auth/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function VerifyPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phoneNumber?: string }>();
  const phoneNumber = params.phoneNumber;

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const login = useAuthStore((state) => state.login);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setLoading(true);
    setApiError(null);

    try {
      const response = await authService.verifyPassword(data.password, phoneNumber);

      if (response.token && response.user) {
        await login(response.token, response.user);
        router.replace('/(tabs)');
      } else {
        setApiError('Unexpected server response. Please try again.');
      }
    } catch (err: any) {
      setApiError(err.message || 'Incorrect Two-Step Verification password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.iconContainer}>
            <KeyRound size={36} color={colors.primary.DEFAULT} />
          </View>

          <Text style={styles.title}>Two-Step Verification</Text>
          <Text style={styles.subtitle}>
            Your Telegram account is protected by an additional cloud password. Please enter it below to complete sign-in.
          </Text>

          <Card style={styles.card}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Telegram Cloud Password"
                  placeholder="Enter your 2FA password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  leftIcon={<ShieldAlert size={20} color={colors.text.muted} />}
                  rightIcon={
                    showPassword ? (
                      <EyeOff size={20} color={colors.text.muted} />
                    ) : (
                      <Eye size={20} color={colors.text.muted} />
                    )
                  }
                  onPressRightIcon={() => setShowPassword((prev) => !prev)}
                  error={errors.password?.message || (apiError ?? undefined)}
                />
              )}
            />

            <Button
              title="Submit & Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              size="lg"
              style={styles.submitButton}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    alignItems: 'center',
    flexGrow: 1,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary.subtle,
    borderWidth: 1.5,
    borderColor: colors.primary.subtleBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  title: {
    ...typography.presets.title2,
    color: colors.text.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.presets.subhead,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    marginBottom: spacing.xxl,
  },
  card: {
    width: '100%',
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
