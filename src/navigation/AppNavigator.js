import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import BiometricLockScreen from '../screens/auth/BiometricLockScreen';

// Auth Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Donor Screens
import DonorDashboardScreen from '../screens/donor/DonorDashboardScreen';
import PaymentScreen from '../screens/donor/PaymentScreen';
import DonorPassportScreen from '../screens/donor/DonorPassportScreen';
import LeaderboardScreen from '../screens/donor/LeaderboardScreen';

// Hospital Screens
import HospitalDashboardScreen from '../screens/hospital/HospitalDashboardScreen';
import CreateRequestScreen from '../screens/hospital/CreateRequestScreen';
import ResponseTrackerScreen from '../screens/hospital/ResponseTrackerScreen';
import BloodInventoryScreen from '../screens/hospital/BloodInventoryScreen';
import RegionalHeatmapScreen from '../screens/hospital/RegionalHeatmapScreen';
import QRCheckInScreen from '../screens/hospital/QRCheckInScreen';

// Shared Screens
import LiveMapScreen from '../screens/shared/LiveMapScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: '#0B0F17' },
  animation: 'slide_from_right',
};

export default function AppNavigator() {
  const { user, loading } = useAuth();
  // biometricUnlocked: true once user passes lock screen (or chooses password fallback)
  const [biometricUnlocked, setBiometricUnlocked] = useState(false);

  if (loading) {
    return <Spinner overlay message="Restoring LifeLink Session..." />;
  }

  // If the user has an active session but hasn't passed biometric gate yet
  if (user && !biometricUnlocked) {
    return (
      <BiometricLockScreen
        onUnlock={() => setBiometricUnlocked(true)}
        onUsePassword={() => setBiometricUnlocked(true)}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!user ? (
          // Unauthenticated Stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : user.role === 'hospital' ? (
          // Hospital Stack
          <>
            <Stack.Screen name="HospitalDashboard" component={HospitalDashboardScreen} />
            <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
            <Stack.Screen name="ResponseTracker" component={ResponseTrackerScreen} />
            <Stack.Screen name="BloodInventory" component={BloodInventoryScreen} />
            <Stack.Screen name="RegionalHeatmap" component={RegionalHeatmapScreen} />
            <Stack.Screen name="QRCheckIn" component={QRCheckInScreen} />
            <Stack.Screen name="LiveMap" component={LiveMapScreen} />
          </>
        ) : (
          // Donor Stack
          <>
            <Stack.Screen name="DonorDashboard" component={DonorDashboardScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="DonorPassport" component={DonorPassportScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="LiveMap" component={LiveMapScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
