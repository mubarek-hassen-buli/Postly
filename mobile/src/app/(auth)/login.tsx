import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, ChevronDown, ChevronLeft } from 'lucide-react-native';

import { authService } from '../../services/auth/authService';
import { colors } from '../../theme/colors';
import { Country, CountryPickerModal, COUNTRIES_DATA } from '../../components/auth/CountryPickerModal';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Default to Netherlands +31 (matching inspiration image) or easily selectable
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES_DATA[0]);
  const [nationalNumber, setNationalNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/onboarding');
    }
  };

  const handleContinue = async () => {
    const cleanDigits = nationalNumber.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 6) {
      setApiError('Please enter a valid phone number');
      return;
    }

    const fullPhoneNumber = `${selectedCountry.dialCode}${cleanDigits}`;
    setLoading(true);
    setApiError(null);

    try {
      const response = await authService.sendCode(fullPhoneNumber);
      router.push({
        pathname: '/(auth)/verify-otp',
        params: {
          phoneNumber: fullPhoneNumber,
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      {/* Top Banner (Postly Signature Blue/Teal Gradient matching inspiration layout) */}
      <LinearGradient
        colors={['#0077B6', '#0096C7', '#2AABEE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.topBanner, { paddingTop: Math.max(insets.top, 16) }]}
      >
        {/* Subtle geometric pattern overlay */}
        <View style={styles.bannerPatternLayer}>
          <View style={styles.patternCircleLarge} />
          <View style={styles.patternCircleMedium} />
        </View>

        {/* Back Button */}
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

      {/* Main White Content Card with High Curved Top */}
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
          {/* Headline & Subtitle */}
          <View style={styles.headerArea}>
            <Text style={styles.title}>Welcome to Postly</Text>
            <Text style={styles.subtitle}>Where Connections Come Alive.</Text>
          </View>

          {/* Phone Field Section */}
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Phone Number</Text>

            {/* Input Capsule with Country Picker Trigger */}
            <View style={[styles.inputCapsule, apiError ? styles.inputCapsuleError : null]}>
              {/* Country Selection Button */}
              <TouchableOpacity
                onPress={() => setPickerVisible(true)}
                style={styles.countryPickerTrigger}
                activeOpacity={0.7}
                accessibilityLabel={`Select country code, currently ${selectedCountry.name} ${selectedCountry.dialCode}`}
              >
                <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
                <Text style={styles.dialCodeText}>{selectedCountry.dialCode}</Text>
                <ChevronDown size={14} color="#6B7280" style={styles.chevronIcon} />
              </TouchableOpacity>

              {/* Vertical Divider */}
              <View style={styles.divider} />

              {/* National Number Input */}
              <TextInput
                style={styles.numberInput}
                placeholder="0000000000"
                placeholderTextColor="#9CA3AF"
                value={nationalNumber}
                onChangeText={(text) => {
                  setNationalNumber(text);
                  if (apiError) setApiError(null);
                }}
                keyboardType="phone-pad"
                autoComplete="tel"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>

            {/* Error Message */}
            {apiError && (
              <View style={styles.errorRow}>
                <AlertCircle size={14} color={colors.status.error} />
                <Text style={styles.errorText}>{apiError}</Text>
              </View>
            )}

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleContinue}
              disabled={loading}
              activeOpacity={0.88}
              style={styles.continueButtonWrapper}
              accessibilityRole="button"
              accessibilityLabel="Continue to OTP verification"
            >
              <LinearGradient
                colors={['#0088CC', '#2AABEE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueButton}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.continueButtonText}>Continue</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Bottom Watermark Skyline Graphic (Soft, ambient silhouette) */}
          <View style={styles.watermarkArea}>
            <View style={styles.watermarkArchCenter} />
            <View style={styles.watermarkArchLeft} />
            <View style={styles.watermarkArchRight} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Code Picker Modal */}
      <CountryPickerModal
        visible={pickerVisible}
        selectedCountry={selectedCountry}
        onSelect={(country) => setSelectedCountry(country)}
        onClose={() => setPickerVisible(false)}
      />
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
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14.5,
    color: '#6B7280',
    lineHeight: 20,
  },
  formSection: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  inputCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    height: 56,
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  inputCapsuleError: {
    borderColor: colors.status.error,
  },
  countryPickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  flagEmoji: {
    fontSize: 22,
    marginRight: 6,
  },
  dialCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginRight: 4,
  },
  chevronIcon: {
    marginLeft: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  numberInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
    letterSpacing: 0.5,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    color: colors.status.error,
    fontWeight: '500',
  },
  continueButtonWrapper: {
    marginTop: 24,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#0088CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  continueButton: {
    height: 52,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Watermark Skyline Motif at bottom
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
