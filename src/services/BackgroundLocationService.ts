/**
 * BackgroundLocationService — Real-time donor ETA calculation via background location
 * Uses expo-task-manager + expo-location for persistent tracking when donor is en route
 */
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BackgroundLocationPayload, GeoLocation } from '../types';

export const BACKGROUND_LOCATION_TASK = 'LIFELINK_BACKGROUND_LOCATION';
const LAST_LOCATION_KEY = '@lifelink_last_known_location';
const TRACKING_ACTIVE_KEY = '@lifelink_tracking_active';

// ─── Task Definition ─────────────────────────────────────────
// Must be defined at module top level — not inside a function
TaskManager.defineTask(
  BACKGROUND_LOCATION_TASK,
  async ({ data, error }: { data: unknown; error: TaskManager.TaskManagerError | null }) => {
    if (error) {
      console.error('[BackgroundLocation] Task error:', error.message);
      return;
    }

    const payload = data as BackgroundLocationPayload;
    if (payload?.locations && payload.locations.length > 0) {
      const latest = payload.locations[payload.locations.length - 1];
      const loc: GeoLocation = {
        lat: latest.coords.latitude,
        lng: latest.coords.longitude,
        city: 'En Route',
      };

      try {
        await AsyncStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(loc));
        console.log(
          `[BackgroundLocation] Updated: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`
        );
      } catch (e) {
        console.warn('[BackgroundLocation] Failed to save location:', e);
      }
    }
  }
);

/**
 * Request necessary location permissions (foreground + background)
 */
export async function requestLocationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: fg } = await Location.requestForegroundPermissionsAsync();
  if (fg !== 'granted') {
    console.warn('[BackgroundLocation] Foreground permission denied');
    return false;
  }

  const { status: bg } = await Location.requestBackgroundPermissionsAsync();
  if (bg !== 'granted') {
    console.warn('[BackgroundLocation] Background permission denied — tracking limited to foreground');
    // Allow foreground-only tracking
    return true;
  }

  return true;
}

/**
 * Start background location tracking (called when donor taps "I'm En Route")
 */
export async function startBackgroundTracking(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
    if (isRegistered) {
      console.log('[BackgroundLocation] Already tracking');
      return true;
    }

    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) return false;

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 50, // Update every 50 meters
      timeInterval: 30000,  // Or every 30 seconds
      foregroundService: {
        notificationTitle: '🩸 LifeLink — En Route',
        notificationBody: 'Location tracked for ETA calculation',
        notificationColor: '#FF3B5C',
      },
      showsBackgroundLocationIndicator: true,
      pausesUpdatesAutomatically: false,
    });

    await AsyncStorage.setItem(TRACKING_ACTIVE_KEY, 'true');
    console.log('[BackgroundLocation] Tracking started');
    return true;
  } catch (err) {
    console.error('[BackgroundLocation] Failed to start:', err);
    return false;
  }
}

/**
 * Stop background location tracking (called after QR check-in or cancellation)
 */
export async function stopBackgroundTracking(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
    await AsyncStorage.setItem(TRACKING_ACTIVE_KEY, 'false');
    console.log('[BackgroundLocation] Tracking stopped');
  } catch (err) {
    console.error('[BackgroundLocation] Failed to stop:', err);
  }
}

/**
 * Get the last known background-tracked location
 */
export async function getLastKnownLocation(): Promise<GeoLocation | null> {
  try {
    const stored = await AsyncStorage.getItem(LAST_LOCATION_KEY);
    if (stored) return JSON.parse(stored) as GeoLocation;
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if background tracking is currently active
 */
export async function isTrackingActive(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') return false;
    const val = await AsyncStorage.getItem(TRACKING_ACTIVE_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

/**
 * Get current foreground position (one-shot)
 */
export async function getCurrentPosition(): Promise<GeoLocation | null> {
  if (Platform.OS === 'web') return null;

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const geoLoc: GeoLocation = {
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      city: 'Current Location',
    };

    // Try reverse geocode for city name
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (address) {
        geoLoc.city =
          address.city ||
          address.subregion ||
          address.district ||
          address.region ||
          'Current Location';
      }
    } catch {
      // Non-fatal — city name is best-effort
    }

    // Persist for offline access
    await AsyncStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(geoLoc));
    return geoLoc;
  } catch (err) {
    console.error('[BackgroundLocation] getCurrentPosition failed:', err);
    return null;
  }
}
