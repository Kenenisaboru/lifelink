/**
 * Unit Tests — Payment Calculation & Transport Fee Logic
 */
import {
  calculateSuggestedTransportFee,
  generateFakeTransactionId,
  PAYMENT_METHODS,
} from '../../utils/paymentCalc';

describe('calculateSuggestedTransportFee', () => {
  it('returns default fee for zero distance', () => {
    expect(calculateSuggestedTransportFee(0)).toBe(500);
  });

  it('returns default fee for negative distance', () => {
    expect(calculateSuggestedTransportFee(-5)).toBe(500);
  });

  it('returns minimum 500 for very short distances', () => {
    expect(calculateSuggestedTransportFee(0.1)).toBeGreaterThanOrEqual(500);
  });

  it('increases with distance', () => {
    const fee1 = calculateSuggestedTransportFee(2);
    const fee2 = calculateSuggestedTransportFee(5);
    const fee3 = calculateSuggestedTransportFee(10);
    expect(fee2).toBeGreaterThan(fee1);
    expect(fee3).toBeGreaterThan(fee2);
  });

  it('rounds to nearest 50', () => {
    const fee = calculateSuggestedTransportFee(3);
    expect(fee % 50).toBe(0);
  });

  it('calculates correctly: 5km = 400 + (5*80) = 800 → rounds to 800', () => {
    const fee = calculateSuggestedTransportFee(5);
    // 400 + 5*80 = 800, already multiple of 50
    expect(fee).toBe(800);
  });

  it('calculates correctly: 10km = 400 + (10*80) = 1200', () => {
    const fee = calculateSuggestedTransportFee(10);
    expect(fee).toBe(1200);
  });

  it('uses custom defaultBaseFee when distance is 0', () => {
    expect(calculateSuggestedTransportFee(0, 750)).toBe(750);
  });
});

describe('generateFakeTransactionId', () => {
  it('generates string with correct prefix for telebirr', () => {
    const id = generateFakeTransactionId('telebirr');
    expect(id).toMatch(/^TELEBIRR-[A-Z0-9]{8}$/);
  });

  it('generates string with correct prefix for mpesa', () => {
    const id = generateFakeTransactionId('mpesa');
    expect(id).toMatch(/^MPESA-[A-Z0-9]{8}$/);
  });

  it('generates string with correct prefix for chapa', () => {
    const id = generateFakeTransactionId('chapa');
    expect(id).toMatch(/^CHAPA-[A-Z0-9]{8}$/);
  });

  it('generates unique IDs on multiple calls', () => {
    const ids = new Set(
      Array.from({ length: 50 }, () => generateFakeTransactionId('telebirr'))
    );
    // With 50 calls, should have many unique IDs (not guaranteed all unique due to randomness,
    // but statistically should be mostly unique)
    expect(ids.size).toBeGreaterThan(40);
  });

  it('falls back to telebirr prefix for unknown method', () => {
    const id = generateFakeTransactionId('unknown_gateway');
    expect(id).toMatch(/^TELEBIRR-/);
  });
});

describe('PAYMENT_METHODS', () => {
  it('contains 5 payment methods', () => {
    expect(PAYMENT_METHODS).toHaveLength(5);
  });

  it('all methods have required fields', () => {
    PAYMENT_METHODS.forEach((method) => {
      expect(method).toHaveProperty('id');
      expect(method).toHaveProperty('name');
      expect(method).toHaveProperty('icon');
      expect(method).toHaveProperty('prefix');
      expect(method).toHaveProperty('color');
      expect(method.prefix.endsWith('-')).toBe(true);
    });
  });

  it('contains telebirr, mpesa, chapa, cbebirr, amole', () => {
    const ids = PAYMENT_METHODS.map((m) => m.id);
    expect(ids).toContain('telebirr');
    expect(ids).toContain('mpesa');
    expect(ids).toContain('chapa');
    expect(ids).toContain('cbebirr');
    expect(ids).toContain('amole');
  });
});
