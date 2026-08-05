import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { RequestProvider } from './src/context/RequestContext';
import { GamificationProvider } from './src/context/GamificationContext';
import { InventoryProvider } from './src/context/InventoryContext';
import { registerForPushNotificationsAsync } from './src/services/NotificationService';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    // Register for push notifications on launch
    registerForPushNotificationsAsync().catch(() => {
      // Non-fatal: silently ignore if notifications not supported
    });
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthProvider>
          <RequestProvider>
            <GamificationProvider>
              <InventoryProvider>
                <AppNavigator />
              </InventoryProvider>
            </GamificationProvider>
          </RequestProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

