import React, { useEffect } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationBar } from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryClient } from '../services/api/queryClient';
import { useAuthStore } from '../store/useAuthStore';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ToastContainer } from '../components/common/ToastContainer';
import { colors } from '../theme/colors';

export default function RootLayout() {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        NavigationBar.setStyle('light');
      } catch {
        // Safe fallback
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar
              barStyle="dark-content"
              backgroundColor={colors.background.base}
              translucent={false}
            />
            {Platform.OS === 'android' && <NavigationBar style="light" />}
            <View style={styles.container}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background.base },
                  animation: 'fade',
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="compose"
                  options={{
                    presentation: 'modal',
                    headerShown: false,
                    animation: 'slide_from_bottom',
                  }}
                />
              </Stack>
              <ToastContainer />
            </View>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
});
