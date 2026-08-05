/**
 * Unit Tests — Haversine Distance & Blood Compatibility
 */
import { calculateHaversineDistance, isBloodCompatible } from '../../utils/distance';

describe('calculateHaversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(calculateHaversineDistance(-1.286, 36.817, -1.286, 36.817)).toBe(0);
  });

  it('returns 0 for null coordinates', () => {
    expect(calculateHaversineDistance(null, null, null, null)).toBe(0);
    expect(calculateHaversineDistance(undefined, undefined, -1.286, 36.817)).toBe(0);
  });

  it('calculates correct approximate distance between two Nairobi points', () => {
    // Nairobi CBD to Upper Hill — approx 2–3 km
    const dist = calculateHaversineDistance(
      -1.286389, 36.817223, // Nairobi CBD
      -1.2921,   36.8219    // Upper Hill
    );
    expect(dist).toBeGreaterThan(0.5);
    expect(dist).toBeLessThan(5);
  });

  it('calculates distance from Nairobi to Mombasa (~470km)', () => {
    const dist = calculateHaversineDistance(
      -1.286389, 36.817223, // Nairobi
      -4.043477, 39.668206  // Mombasa
    );
    expect(dist).toBeGreaterThan(400);
    expect(dist).toBeLessThan(550);
  });

  it('returns a number rounded to 1 decimal place', () => {
    const dist = calculateHaversineDistance(-1.286389, 36.817223, -1.3, 36.85);
    const decimalPart = (dist * 10) % 1;
    expect(decimalPart).toBe(0); // rounded to 1 decimal
  });

  it('is symmetric — A to B equals B to A', () => {
    const d1 = calculateHaversineDistance(-1.286389, 36.817223, -1.2921, 36.8219);
    const d2 = calculateHaversineDistance(-1.2921, 36.8219, -1.286389, 36.817223);
    expect(d1).toBe(d2);
  });

  it('handles short distances (< 1 km)', () => {
    const dist = calculateHaversineDistance(-1.2921, 36.8219, -1.2925, 36.8225);
    expect(dist).toBeGreaterThanOrEqual(0);
    expect(dist).toBeLessThan(1);
  });
});

describe('isBloodCompatible', () => {
  it('returns true for exact blood type match', () => {
    expect(isBloodCompatible('A+', 'A+')).toBe(true);
    expect(isBloodCompatible('O-', 'O-')).toBe(true);
    expect(isBloodCompatible('AB+', 'AB+')).toBe(true);
  });

  it('O- (universal donor) is compatible with all types', () => {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    bloodTypes.forEach((bt) => {
      expect(isBloodCompatible('O-', bt)).toBe(true);
    });
  });

  it('AB+ (universal recipient) accepts all donor types', () => {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    bloodTypes.forEach((bt) => {
      expect(isBloodCompatible(bt, 'AB+')).toBe(true);
    });
  });

  it('returns false for incompatible types', () => {
    expect(isBloodCompatible('A+', 'B+')).toBe(false);
    expect(isBloodCompatible('B-', 'A-')).toBe(false);
    expect(isBloodCompatible('A+', 'O+')).toBe(false);
  });

  it('returns false for null/undefined inputs', () => {
    expect(isBloodCompatible(null, 'O+')).toBe(false);
    expect(isBloodCompatible('O+', null)).toBe(false);
    expect(isBloodCompatible(undefined, undefined)).toBe(false);
  });
});
