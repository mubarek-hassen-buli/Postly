import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Image } from 'react-native';
import { Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/useAuthStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export default function Index() {
  const { isAuthenticated, isInitialized, isLoading } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.background.base, colors.background.surface, colors.background.base]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.centerContent}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandTitle}>Postly</Text>
          <ActivityIndicator size="small" color={colors.primary.DEFAULT} style={styles.loader} />
        </View>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/onboarding" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.background.surface,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  appIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
  },
  brandTitle: {
    fontFamily: typography.fonts.display,
    fontSize: 34,
    lineHeight: 42,
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  loader: {
    marginTop: spacing.lg,
  },
});
