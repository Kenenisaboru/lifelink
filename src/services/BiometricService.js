/**
 * BiometricService — FaceID / Fingerprint authentication wrapper
 * Uses expo-local-authentication
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_PREF_KEY = 'lifelink_biometric_enabled';

/**
 * Check if biometric authentication is available and enrolled on this device
 * @returns {{ available, type, typeLabel }}
 */
export async function checkBiometricAvailability() {
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
}

/**
 * Prompt biometric authentication
 * @param {object} options
 * @param {string} options.promptMessage - Message to show in biometric prompt
 * @param {string} options.fallbackLabel - Label for fallback button
 * @returns {{ success, error, biometricType }}
 */
export async function authenticateWithBiometrics({
  promptMessage = 'Verify your identity to continue',
  fallbackLabel = 'Use Password',
} = {}) {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel,
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });

    return {
      success: result.success,
      error: result.error || null,
      warning: result.warning || null,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Save biometric preference to secure store
 */
export async function setBiometricPreference(enabled) {
  await SecureStore.setItemAsync(BIOMETRIC_PREF_KEY, enabled ? 'true' : 'false');
}

/**
 * Get current biometric preference
 */
export async function getBiometricPreference() {
  const val = await SecureStore.getItemAsync(BIOMETRIC_PREF_KEY);
  return val === 'true';
}

/**
 * Save session credentials securely
 */
export async function saveCredentialsSecurely(uid, role) {
  await SecureStore.setItemAsync('lifelink_uid', uid);
  await SecureStore.setItemAsync('lifelink_role', role);
}

/**
 * Get saved session from secure store
 */
export async function getSecureSession() {
  const uid = await SecureStore.getItemAsync('lifelink_uid');
  const role = await SecureStore.getItemAsync('lifelink_role');
  return uid ? { uid, role } : null;
}

/**
 * Clear secure session (logout)
 */
export async function clearSecureSession() {
  await SecureStore.deleteItemAsync('lifelink_uid');
  await SecureStore.deleteItemAsync('lifelink_role');
}
