import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Phone, ShieldCheck, Send } from 'lucide-react-native';

import { phoneSchema, PhoneFormValues } from '../../schemas/authSchemas';
import { authService } from '../../services/auth/authService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });

  const onSubmit = async (data: PhoneFormValues) => {
    setLoading(true);
    setApiError(null);

    try {
      const response = await authService.sendCode(data.phoneNumber);
      router.push({
        pathname: '/(auth)/verify-otp',
        params: {
          phoneNumber: data.phoneNumber,
          phoneCodeHash: response.phone_code_hash,
          isCodeViaApp: response.is_code_via_app ? 'true' : 'false',
        },
      });
    } catch (error: any) {
      setApiError(error.message || 'Failed to send login code. Please check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/onboarding');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topNavRow}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Back to feature tour"
          accessibilityRole="button"
        >
          <ChevronLeft size={22} color={colors.text.primary} />
          <Text style={styles.backButtonText}>Tour</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoCircle}>
              <Send size={36} color={colors.primary.DEFAULT} style={styles.logoIcon} />
            </View>
            <Text style={styles.title}>Welcome to Postly</Text>
            <Text style={styles.subtitle}>
              Connect your Telegram account to manage and schedule posts across all your channels.
            </Text>
          </View>

          {/* Input Card */}
          <Card style={styles.formCard}>
            <Text style={styles.cardHeader}>Telegram Phone Number</Text>
            <Text style={styles.cardSubtext}>
              Please enter your phone number with your country code prefix.
            </Text>

            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="+1 234 567 8900"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  autoCapitalize="none"
                  leftIcon={<Phone size={20} color={colors.text.muted} />}
                  error={errors.phoneNumber?.message || (apiError ?? undefined)}
                  helperText="Format: +[Country Code][Number]"
                />
              )}
            />

            <Button
              title="Send Verification Code"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              size="lg"
              style={styles.submitButton}
            />
          </Card>

          {/* Security Notice */}
          <View style={styles.securityBanner}>
            <ShieldCheck size={20} color={colors.primary.DEFAULT} style={styles.shieldIcon} />
            <Text style={styles.securityText}>
              Official Telegram MTProto Protocol. Your session keys are encrypted at rest with AES-256 and never shared with third parties.
            </Text>
          </View>

          {/* Feature Tour Link */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/onboarding')}
            style={styles.tourLink}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Explore Postly feature tour"
          >
            <Text style={styles.tourPrompt}>
              New to Postly? <Text style={styles.tourHighlight}>Explore Features Tour</Text>
            </Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    flexGrow: 1,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary.subtle,
    borderWidth: 1.5,
    borderColor: colors.primary.subtleBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoIcon: {
    marginLeft: -2,
  },
  title: {
    ...typography.presets.title1,
    color: colors.text.primary,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.presets.subhead,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  cardHeader: {
    ...typography.presets.title3,
    color: colors.text.primary,
    marginBottom: 4,
  },
  cardSubtext: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  shieldIcon: {
    marginRight: spacing.md,
    flexShrink: 0,
  },
  securityText: {
    ...typography.presets.caption,
    color: colors.text.muted,
    flex: 1,
    lineHeight: 16,
  },
  topNavRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  backButtonText: {
    ...typography.presets.subhead,
    color: colors.text.primary,
    fontWeight: '600',
  },
  tourLink: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  tourPrompt: {
    ...typography.presets.subhead,
    color: colors.text.secondary,
  },
  tourHighlight: {
    color: colors.primary.DEFAULT,
    fontWeight: '700',
  },
});
