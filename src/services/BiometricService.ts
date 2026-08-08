import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BiometricAvailability, BiometricAuthResult } from '../types';

const BIOMETRIC_PREF_KEY = 'lifelink_biometric_enabled';

/**
 * Check if biometric authentication is available and enrolled on this device
 */
export async function checkBiometricAvailability(): Promise<BiometricAvailability> {
  if (Platform.OS === 'web') {
    return {
      available: false,
      hasHardware: false,
      isEnrolled: false,
      isFaceId: false,
      isFingerprint: false,
      typeLabel: 'Biometrics',
    };
  }

  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    const isFaceId = supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    const isFingerprint = supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);

    let typeLabel = 'Biometrics';
    if (isFaceId) typeLabel = 'Face ID';
    else if (isFingerprint) typeLabel = 'Fingerprint';

    return {
      available: hasHardware && isEnrolled,
      hasHardware,
      isEnrolled,
      isFaceId,
      isFingerprint,
      typeLabel,
    };
  } catch (e) {
    return { available: false, typeLabel: 'Biometrics' };
  }
}

/**
 * Prompt biometric authentication
 */
export async function authenticateWithBiometrics({
  promptMessage = 'Verify your identity to continue',
  fallbackLabel = 'Use Password',
}: {
  promptMessage?: string;
  fallbackLabel?: string;
} = {}): Promise<BiometricAuthResult> {
  if (Platform.OS === 'web') {
    return { success: true };
  }

  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel,
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });

    const biometricResult = result as { success: boolean; error?: string | null; warning?: string | null };

    return {
      success: biometricResult.success,
      error: biometricResult.error ?? null,
      warning: biometricResult.warning ?? null,
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Save biometric preference securely
 */
export async function setBiometricPreference(enabled: boolean): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(BIOMETRIC_PREF_KEY, enabled ? 'true' : 'false');
    return;
  }
  await SecureStore.setItemAsync(BIOMETRIC_PREF_KEY, enabled ? 'true' : 'false');
}

/**
 * Get current biometric preference
 */
export async function getBiometricPreference(): Promise<boolean> {
  if (Platform.OS === 'web') {
    const val = await AsyncStorage.getItem(BIOMETRIC_PREF_KEY);
    return val === 'true';
  }
  const val = await SecureStore.getItemAsync(BIOMETRIC_PREF_KEY);
  return val === 'true';
}

/**
 * Save session credentials securely
 */
export async function saveCredentialsSecurely(uid: string, role: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('lifelink_uid', uid);
    await AsyncStorage.setItem('lifelink_role', role);
    return;
  }
  await SecureStore.setItemAsync('lifelink_uid', uid);
  await SecureStore.setItemAsync('lifelink_role', role);
}

/**
 * Get saved session from secure store
 */
export async function getSecureSession(): Promise<{ uid: string; role: string } | null> {
  if (Platform.OS === 'web') {
    const uid = await AsyncStorage.getItem('lifelink_uid');
    const role = await AsyncStorage.getItem('lifelink_role');
    return uid && role ? { uid, role } : null;
  }
  const uid = await SecureStore.getItemAsync('lifelink_uid');
  const role = await SecureStore.getItemAsync('lifelink_role');
  return uid && role ? { uid, role } : null;
}

/**
 * Clear secure session (logout)
 */
export async function clearSecureSession(): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem('lifelink_uid');
    await AsyncStorage.removeItem('lifelink_role');
    return;
  }
  await SecureStore.deleteItemAsync('lifelink_uid');
  await SecureStore.deleteItemAsync('lifelink_role');
}
