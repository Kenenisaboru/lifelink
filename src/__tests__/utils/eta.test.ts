/**
 * Unit Tests — ETA Calculation & Distance Formatting
 */
import { calculateETA, formatDistance, interpolatePosition } from '../../utils/eta';

describe('calculateETA', () => {
  it('returns 0 minutes for zero distance', () => {
    const result = calculateETA(0);
    expect(result.minutes).toBe(0);
    expect(result.formatted).toBe('< 1 min');
    expect(result.urgencyColor).toBe('#00E676');
  });

  it('returns green color for < 5 min ETA', () => {
    // 1 km at 25 km/h = 2.4 min
    const result = calculateETA(1);
    expect(result.urgencyColor).toBe('#00E676');
    expect(result.minutes).toBeGreaterThan(0);
  });

  it('returns yellow color for 5–15 min ETA', () => {
    // 4 km at 25 km/h = 9.6 min
    const result = calculateETA(4);
    expect(result.urgencyColor).toBe('#FFC400');
    expect(result.minutes).toBeGreaterThanOrEqual(5);
    expect(result.minutes).toBeLessThan(15);
  });

  it('returns red color for 15–60 min ETA', () => {
    // 8 km at 25 km/h = 19.2 min
    const result = calculateETA(8);
    expect(result.urgencyColor).toBe('#FF3B5C');
    expect(result.minutes).toBeGreaterThanOrEqual(15);
  });

  it('returns hours format for > 60 min ETA', () => {
    // 40 km at 25 km/h = 96 min = 1h 36m
    const result = calculateETA(40);
    expect(result.formatted).toMatch(/h/);
    expect(result.minutes).toBeGreaterThan(60);
    expect(result.urgencyColor).toBe('#FF3B5C');
  });

  it('handles null/undefined gracefully', () => {
    const result = calculateETA(null);
    expect(result.minutes).toBe(0);
    expect(result.formatted).toBe('< 1 min');
  });

  it('respects custom average speed', () => {
    // 10 km at 50 km/h = 12 min (yellow)
    const fast = calculateETA(10, 50);
    // 10 km at 25 km/h = 24 min (red)
    const slow = calculateETA(10, 25);
    expect(fast.minutes).toBeLessThan(slow.minutes);
  });

  it('formatted output contains tilde for estimates', () => {
    const result = calculateETA(5);
    if (result.minutes >= 1) {
      expect(result.formatted).toMatch(/~/);
    }
  });
});

describe('formatDistance', () => {
  it('returns "< 0.1 km" for zero distance', () => {
    expect(formatDistance(0)).toBe('< 0.1 km');
    expect(formatDistance(null)).toBe('< 0.1 km');
  });

  it('converts meters for distances < 1 km', () => {
    expect(formatDistance(0.5)).toBe('500m');
    expect(formatDistance(0.1)).toBe('100m');
  });

  it('shows km with one decimal for distances >= 1 km', () => {
    expect(formatDistance(1.4)).toBe('1.4 km');
    expect(formatDistance(12.7)).toBe('12.7 km');
    expect(formatDistance(100)).toBe('100.0 km');
  });
});

describe('interpolatePosition', () => {
  const from = { lat: -1.286, lng: 36.817 };
  const to = { lat: -1.292, lng: 36.821 };

  it('returns from position at progress 0', () => {
    const pos = interpolatePosition(from.lat, from.lng, to.lat, to.lng, 0);
    expect(pos.lat).toBeCloseTo(from.lat, 5);
    expect(pos.lng).toBeCloseTo(from.lng, 5);
  });

  it('returns to position at progress 1', () => {
    const pos = interpolatePosition(from.lat, from.lng, to.lat, to.lng, 1);
    expect(pos.lat).toBeCloseTo(to.lat, 5);
    expect(pos.lng).toBeCloseTo(to.lng, 5);
  });

  it('returns midpoint at progress 0.5', () => {
    const pos = interpolatePosition(from.lat, from.lng, to.lat, to.lng, 0.5);
    const midLat = (from.lat + to.lat) / 2;
    const midLng = (from.lng + to.lng) / 2;
    expect(pos.lat).toBeCloseTo(midLat, 5);
    expect(pos.lng).toBeCloseTo(midLng, 5);
  });

  it('clamps progress > 1 to 1', () => {
    const pos = interpolatePosition(from.lat, from.lng, to.lat, to.lng, 1.5);
    expect(pos.lat).toBeCloseTo(to.lat, 5);
  });

  it('clamps progress < 0 to 0', () => {
    const pos = interpolatePosition(from.lat, from.lng, to.lat, to.lng, -0.5);
    expect(pos.lat).toBeCloseTo(from.lat, 5);
  });
});
