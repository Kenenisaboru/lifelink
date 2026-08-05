/**
 * HapticsService — Centralized haptic feedback for emergency events
 * Wraps expo-haptics with graceful degradation for platforms without vibration support
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isSupported = Platform.OS !== 'web';

/**
 * Emergency alert received — strong double tap to grab attention
 */
export async function hapticEmergencyAlert(): Promise<void> {
  if (!isSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await new Promise((r) => setTimeout(r, 120));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Non-fatal
  }
}

/**
 * QR code scanned successfully — success pattern
 */
export async function hapticQRScanSuccess(): Promise<void> {
  if (!isSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Non-fatal
  }
}

/**
 * Payment confirmed / escrow released — success tap
 */
export async function hapticPaymentConfirmed(): Promise<void> {
  if (!isSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Non-fatal
  }
}

/**
 * Payment failed / error — error feedback
 */
export async function hapticError(): Promise<void> {
  if (!isSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Non-fatal
  }
}

/**
 * Selection changed (toggle, tab switch) — light tap
 */
export async function hapticSelection(): Promise<void> {
  if (!isSupported) return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // Non-fatal
  }
}

/**
 * Light UI interaction (button press, card tap)
 */
export async function hapticLight(): Promise<void> {
  if (!isSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Non-fatal
  }
}

/**
 * Medium impact (confirm action)
 */
export async function hapticMedium(): Promise<void> {
  if (!isSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Non-fatal
  }
}

/**
 * Heavy impact (destructive action warning)
 */
export async function hapticHeavy(): Promise<void> {
  if (!isSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {
    // Non-fatal
  }
}

/**
 * Donor availability toggled — medium impact
 */
export async function hapticAvailabilityToggle(enabled: boolean): Promise<void> {
  if (!isSupported) return;
  try {
    if (enabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch {
    // Non-fatal
  }
}
