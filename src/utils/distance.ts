/**
 * Haversine Distance Formula
 * Calculates the great-circle distance between two points (lat1, lng1) and (lat2, lng2) in kilometers.
 */
export function calculateHaversineDistance(
  lat1: number | undefined | null,
  lng1: number | undefined | null,
  lat2: number | undefined | null,
  lng2: number | undefined | null
): number {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
    return 0;
  }

  const R = 6371; // Earth radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  return Math.round(distanceKm * 10) / 10; // round to 1 decimal place (e.g., 2.4 km)
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Blood Type Compatibility Checker (Exact match + Universal Donor/Recipient logic)
 */
export function isBloodCompatible(
  donorType: string | undefined | null,
  requestType: string | undefined | null
): boolean {
  if (!donorType || !requestType) return false;
  // Exact match
  if (donorType === requestType) return true;
  // O- is universal donor
  if (donorType === 'O-') return true;
  // AB+ is universal recipient
  if (requestType === 'AB+') return true;

  return false;
}
