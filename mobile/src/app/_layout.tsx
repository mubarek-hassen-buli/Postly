import React, { useEffect } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationBar } from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryClient } from '../services/api/queryClient';
import { queryPersistOptions } from '../services/storage/queryPersistor';
import { useAuthStore } from '../store/useAuthStore';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ToastContainer } from '../components/common/ToastContainer';
import { OfflineNoticeBar } from '../components/common/OfflineNoticeBar';
import { colors } from '../theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Fredoka': require('../../assets/fonts/Fredoka/Fredoka-VariableFont_wdth,wght.ttf'),
    'Fredoka-Light': require('../../assets/fonts/Fredoka/static/Fredoka-Light.ttf'),
    'Fredoka-Regular': require('../../assets/fonts/Fredoka/static/Fredoka-Regular.ttf'),
    'Fredoka-Medium': require('../../assets/fonts/Fredoka/static/Fredoka-Medium.ttf'),
    'Fredoka-SemiBold': require('../../assets/fonts/Fredoka/static/Fredoka-SemiBold.ttf'),
    'Fredoka-Bold': require('../../assets/fonts/Fredoka/static/Fredoka-Bold.ttf'),
  });

  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        NavigationBar.setStyle('light');
      } catch {
        // Safe fallback
      }
    }
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={queryPersistOptions}
          >
            <StatusBar
              barStyle="dark-content"
              backgroundColor="transparent"
              translucent={true}
            />
            {Platform.OS === 'android' && <NavigationBar style="light" />}
            <View style={styles.container}>
              <OfflineNoticeBar />
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
          </PersistQueryClientProvider>
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
