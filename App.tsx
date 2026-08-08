import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import { registerForPushNotificationsAsync } from './src/services/NotificationService';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeFirebase } from './src/firebase/authService';

// Initialize Sentry crash monitoring
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || 'https://placeholder@sentry.io/lifelink',
  debug: false,
});

function App() {
  useEffect(() => {
    initializeFirebase().catch(() => {
      // Non-fatal
    });

    registerForPushNotificationsAsync().catch(() => {
      // Non-fatal
    });
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default Sentry.wrap(App);
