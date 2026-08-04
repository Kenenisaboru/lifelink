/**
 * Dynamic M-Pesa Transport Fee Calculator
 * Calculates suggested transport assistance based on distance in kilometers.
 * Formula: Base fee (KSh 400) + (distanceKm * ratePerKm KSh 80), rounded to nearest 50 KSh.
 */
export function calculateSuggestedTransportFee(distanceKm = 0, defaultBaseFee = 500) {
  if (!distanceKm || distanceKm <= 0) {
    return defaultBaseFee;
  }

  const baseFee = 400;
  const ratePerKm = 80;
  const rawFee = baseFee + distanceKm * ratePerKm;

  // Round to nearest 50 KSh (e.g. 692 -> 700)
  const roundedFee = Math.ceil(rawFee / 50) * 50;
  return Math.max(roundedFee, 500); // Minimum KSh 500
}

/**
 * Generates a realistic M-Pesa transaction reference ID
 * Example format: MPESA-QK892X14
 */
export function generateFakeTransactionId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomCode = '';
  for (let i = 0; i < 8; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MPESA-${randomCode}`;
}
