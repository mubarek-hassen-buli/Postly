import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquareCode, RefreshCw } from 'lucide-react-native';

import { authService } from '../../services/auth/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { OtpInput } from '../../components/ui/OtpInput';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const COUNTDOWN_INITIAL = 60;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    phoneNumber: string;
    phoneCodeHash: string;
    isCodeViaApp?: string;
  }>();

  const phoneNumber = params.phoneNumber || '';
  const [phoneCodeHash, setPhoneCodeHash] = useState(params.phoneCodeHash || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_INITIAL);

  const login = useAuthStore((state) => state.login);

  // Countdown timer for code resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Auto-submit when 5 digits are entered
  useEffect(() => {
    if (code.length === 5 && !loading) {
      handleVerify(code);
    }
  }, [code]);

  const handleVerify = async (codeToVerify: string) => {
    if (codeToVerify.length < 5) {
      setError('Please enter the complete 5-digit code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.verifyCode(phoneNumber, phoneCodeHash, codeToVerify);

      if (
        response.requires_password ||
        response.status === 'PENDING_PASSWORD' ||
        response.auth_state === 'PENDING_PASSWORD'
      ) {
        // 2FA Cloud Password required
        router.push({
          pathname: '/(auth)/verify-password',
          params: { phoneNumber },
        });
      } else if (response.token && response.user) {
        // Log in
        await login(response.token, response.user);
        router.replace('/(tabs)');
      } else {
        setError('Unexpected server response. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;

    setResending(true);
    setError(null);

    try {
      const response = await authService.sendCode(phoneNumber);
      setPhoneCodeHash(response.phone_code_hash);
      setCountdown(COUNTDOWN_INITIAL);
      setCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again later.');
    } finally {
      setResending(false);
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
            <MessageSquareCode size={36} color={colors.primary.DEFAULT} />
          </View>

          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            Telegram sent a login code to your active Telegram app or SMS for{' '}
            <Text style={styles.highlightPhone}>{phoneNumber}</Text>
          </Text>

          <Card style={styles.card}>
            <OtpInput
              length={5}
              value={code}
              onChange={setCode}
              error={error ?? undefined}
            />

            <Button
              title="Verify & Continue"
              onPress={() => handleVerify(code)}
              loading={loading}
              disabled={code.length < 5}
              size="lg"
              style={styles.verifyButton}
            />

            <View style={styles.resendRow}>
              {countdown > 0 ? (
                <Text style={styles.countdownText}>
                  Resend code in <Text style={styles.countdownNumber}>{countdown}s</Text>
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={resending}
                  style={styles.resendButton}
                >
                  <RefreshCw size={16} color={colors.primary.DEFAULT} style={styles.resendIcon} />
                  <Text style={styles.resendText}>
                    {resending ? 'Sending...' : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
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
  highlightPhone: {
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    alignItems: 'center',
  },
  verifyButton: {
    width: '100%',
    marginTop: spacing.md,
  },
  resendRow: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  countdownText: {
    ...typography.presets.caption,
    color: colors.text.muted,
  },
  countdownNumber: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  resendIcon: {
    marginRight: spacing.xs,
  },
  resendText: {
    ...typography.presets.subheadMedium,
    color: colors.primary.DEFAULT,
  },
});
