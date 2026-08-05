/**
 * ETA (Estimated Time of Arrival) Calculator
 * Calculates estimated travel time based on Haversine distance and average urban speed.
 */
import type { ETAResult } from '../types';

const DEFAULT_AVG_SPEED_KMH = 25; // Urban Nairobi average (accounting for traffic)

/**
 * Calculate estimated arrival time in minutes
 */
export function calculateETA(
  distanceKm: number | undefined | null,
  avgSpeedKmH: number = DEFAULT_AVG_SPEED_KMH
): ETAResult {
  if (!distanceKm || distanceKm <= 0) {
    return { minutes: 0, formatted: '< 1 min', urgencyColor: '#00E676' };
  }

  const minutes = Math.round((distanceKm / avgSpeedKmH) * 60);

  let formatted: string;
  let urgencyColor: string;

  if (minutes < 1) {
    formatted = '< 1 min';
    urgencyColor = '#00E676'; // green
  } else if (minutes < 5) {
    formatted = `~${minutes} min`;
    urgencyColor = '#00E676'; // green
  } else if (minutes < 15) {
    formatted = `~${minutes} min`;
    urgencyColor = '#FFC400'; // yellow
  } else if (minutes < 60) {
    formatted = `~${minutes} min`;
    urgencyColor = '#FF3B5C'; // red
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    formatted = `~${hours}h ${remainingMins}m`;
    urgencyColor = '#FF3B5C';
  }

  return { minutes, formatted, urgencyColor };
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number | undefined | null): string {
  if (!distanceKm || distanceKm <= 0) return '< 0.1 km';
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Simulate donor movement toward hospital (for demo/animation)
 * Returns intermediate lat/lng positions along the route
 */
export function interpolatePosition(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  progress: number
): { lat: number; lng: number } {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  return {
    lat: fromLat + (toLat - fromLat) * clampedProgress,
    lng: fromLng + (toLng - fromLng) * clampedProgress,
  };
}
