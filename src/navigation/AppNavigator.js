import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

// Auth Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Donor Screens
import DonorDashboardScreen from '../screens/donor/DonorDashboardScreen';
import PaymentScreen from '../screens/donor/PaymentScreen';

// Hospital Screens
import HospitalDashboardScreen from '../screens/hospital/HospitalDashboardScreen';
import CreateRequestScreen from '../screens/hospital/CreateRequestScreen';
import ResponseTrackerScreen from '../screens/hospital/ResponseTrackerScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: '#0B0F17' },
  animation: 'slide_from_right',
};

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner overlay message="Restoring LifeLink Session..." />;
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
          </>
        ) : (
          // Donor Stack
          <>
            <Stack.Screen name="DonorDashboard" component={DonorDashboardScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
