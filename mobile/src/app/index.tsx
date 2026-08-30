import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Send } from 'lucide-react-native';
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
            <Send size={44} color={colors.primary.DEFAULT} style={styles.icon} />
          </View>
          <Text style={styles.brandTitle}>Postly</Text>
          <Text style={styles.tagline}>Telegram Channel Management</Text>
          <ActivityIndicator size="small" color={colors.primary.DEFAULT} style={styles.loader} />
        </View>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
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
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary.subtle,
    borderWidth: 1.5,
    borderColor: colors.primary.subtleBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    marginLeft: -3,
  },
  brandTitle: {
    ...typography.presets.hero,
    color: colors.text.primary,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.presets.subhead,
    color: colors.text.secondary,
    marginBottom: spacing.xxl,
  },
  loader: {
    marginTop: spacing.md,
  },
});
