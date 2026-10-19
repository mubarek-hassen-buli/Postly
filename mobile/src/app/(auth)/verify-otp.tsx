import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, RefreshCw } from 'lucide-react-native';

import { authService } from '../../services/auth/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { OtpInput } from '../../components/ui/OtpInput';
import { colors } from '../../theme/colors';

const COUNTDOWN_INITIAL = 60;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      {/* Top Banner (Postly Signature Blue Gradient matching inspiration) */}
      <LinearGradient
        colors={['#0077B6', '#0096C7', '#2AABEE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.topBanner, { paddingTop: Math.max(insets.top, 16) }]}
      >
        <View style={styles.bannerPatternLayer}>
          <View style={styles.patternCircleLarge} />
          <View style={styles.patternCircleMedium} />
        </View>

        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Main White Card with Curved Top */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.cardContainer}
          contentContainerStyle={styles.cardContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.headerArea}>
            <Text style={styles.title}>Enter Your OTP</Text>
            <Text style={styles.subtitle}>
              Enter the Code that we have sent to{'\n'}
              <Text style={styles.highlightPhone}>{phoneNumber}</Text>
            </Text>
          </View>

          {/* OTP Digit Inputs */}
          <View style={styles.otpSection}>
            <OtpInput
              length={5}
              value={code}
              onChange={setCode}
              error={error ?? undefined}
            />

            {/* Resend OTP Row */}
            <View style={styles.resendRow}>
              {countdown > 0 ? (
                <Text style={styles.countdownText}>
                  Resend OTP in <Text style={styles.countdownNumber}>{countdown}s</Text>
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={resending}
                  style={styles.resendButton}
                  activeOpacity={0.7}
                >
                  <RefreshCw size={14} color={colors.primary.DEFAULT} style={styles.resendIcon} />
                  <Text style={styles.resendText}>
                    {resending ? 'Sending...' : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Verify Code Button */}
            <TouchableOpacity
              onPress={() => handleVerify(code)}
              disabled={loading || code.length < 5}
              activeOpacity={0.88}
              style={[
                styles.verifyButtonWrapper,
                code.length < 5 && styles.verifyButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Verify Code"
            >
              <LinearGradient
                colors={['#0088CC', '#2AABEE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.verifyButton}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify Code</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Bottom Watermark Motif */}
          <View style={styles.watermarkArea}>
            <View style={styles.watermarkArchCenter} />
            <View style={styles.watermarkArchLeft} />
            <View style={styles.watermarkArchRight} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBanner: {
    height: 190,
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerPatternLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  patternCircleLarge: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  patternCircleMedium: {
    position: 'absolute',
    top: 20,
    right: 60,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  keyboardContainer: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    marginTop: -32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  headerArea: {
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 26,
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 14.5,
    color: '#6B7280',
    lineHeight: 22,
  },
  highlightPhone: {
    fontFamily: 'Fredoka-SemiBold',
    color: '#111827',
  },
  otpSection: {
    flex: 1,
    alignItems: 'center',
  },
  resendRow: {
    marginTop: 20,
    marginBottom: 28,
    alignItems: 'center',
  },
  countdownText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  countdownNumber: {
    fontFamily: 'Fredoka-SemiBold',
    color: colors.primary.DEFAULT,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  resendIcon: {
    marginRight: 2,
  },
  resendText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 14,
    color: colors.primary.DEFAULT,
  },
  verifyButtonWrapper: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#0088CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButton: {
    height: 52,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    fontFamily: 'Fredoka-SemiBold',
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 0.2,
  },

  // Watermark Skyline at bottom
  watermarkArea: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 20,
    opacity: 0.25,
    marginTop: 30,
  },
  watermarkArchCenter: {
    width: 90,
    height: 80,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    backgroundColor: '#E0F2FE',
  },
  watermarkArchLeft: {
    width: 65,
    height: 55,
    borderTopLeftRadius: 32.5,
    borderTopRightRadius: 32.5,
    backgroundColor: '#F0F9FF',
  },
  watermarkArchRight: {
    width: 65,
    height: 55,
    borderTopLeftRadius: 32.5,
    borderTopRightRadius: 32.5,
    backgroundColor: '#F0F9FF',
  },
});
