/**
 * ETA (Estimated Time of Arrival) Calculator
 * Calculates estimated travel time based on Haversine distance and average urban speed.
 */

const DEFAULT_AVG_SPEED_KMH = 25; // Urban Nairobi average (accounting for traffic)

/**
 * Calculate estimated arrival time in minutes
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} avgSpeedKmH - Average travel speed in km/h (default: 25)
 * @returns {{ minutes: number, formatted: string, urgencyColor: string }}
 */
export function calculateETA(distanceKm, avgSpeedKmH = DEFAULT_AVG_SPEED_KMH) {
  if (!distanceKm || distanceKm <= 0) {
    return { minutes: 0, formatted: '< 1 min', urgencyColor: '#00E676' };
  }

  const minutes = Math.round((distanceKm / avgSpeedKmH) * 60);

  let formatted;
  let urgencyColor;

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
export function formatDistance(distanceKm) {
  if (!distanceKm || distanceKm <= 0) return '< 0.1 km';
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Simulate donor movement toward hospital (for demo/animation)
 * Returns intermediate lat/lng positions along the route
 */
export function interpolatePosition(fromLat, fromLng, toLat, toLng, progress) {
  // Linear interpolation (0 = at donor, 1 = at hospital)
  const clampedProgress = Math.min(1, Math.max(0, progress));
  return {
    lat: fromLat + (toLat - fromLat) * clampedProgress,
    lng: fromLng + (toLng - fromLng) * clampedProgress,
  };
}
