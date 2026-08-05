/**
 * Supported Payment Gateway Methods Configuration
 */
import type { PaymentMethod, PaymentGateway } from '../types';

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'telebirr',
    name: 'Telebirr',
    subtitle: 'Ethio Telecom Mobile Money',
    color: '#0088FF',
    badgeText: 'TELEBIRR',
    prefix: 'TELEBIRR-',
    icon: '📱',
    phonePlaceholder: '0911234567',
  },
  {
    id: 'mpesa',
    name: 'M-PESA',
    subtitle: 'Safaricom Express Payment',
    color: '#4CAF50',
    badgeText: 'M-PESA',
    prefix: 'MPESA-',
    icon: '📲',
    phonePlaceholder: '0712345678',
  },
  {
    id: 'cbebirr',
    name: 'CBE Birr',
    subtitle: 'Commercial Bank of Ethiopia',
    color: '#FF9800',
    badgeText: 'CBE BIRR',
    prefix: 'CBEBIRR-',
    icon: '🏦',
    phonePlaceholder: '0912345678',
  },
  {
    id: 'chapa',
    name: 'Chapa',
    subtitle: 'Debit/Credit Card & Mobile Pay',
    color: '#00C853',
    badgeText: 'CHAPA',
    prefix: 'CHAPA-',
    icon: '💳',
    phonePlaceholder: '0911234567 / Card',
  },
  {
    id: 'amole',
    name: 'Amole',
    subtitle: 'Dashen Bank Mobile Wallet',
    color: '#9C27B0',
    badgeText: 'AMOLE',
    prefix: 'AMOLE-',
    icon: '💎',
    phonePlaceholder: '0911234567',
  },
];

/**
 * Dynamic Transport Fee Calculator
 * Formula: Base fee (400) + (distanceKm * ratePerKm 80), rounded to nearest 50.
 */
export function calculateSuggestedTransportFee(
  distanceKm: number = 0,
  defaultBaseFee: number = 500
): number {
  if (!distanceKm || distanceKm <= 0) {
    return defaultBaseFee;
  }

  const baseFee = 400;
  const ratePerKm = 80;
  const rawFee = baseFee + distanceKm * ratePerKm;

  const roundedFee = Math.ceil(rawFee / 50) * 50;
  return Math.max(roundedFee, 500);
}

/**
 * Generates a realistic transaction reference ID based on payment method
 */
export function generateFakeTransactionId(methodId: PaymentGateway | string = 'telebirr'): string {
  const method = PAYMENT_METHODS.find((m) => m.id === methodId) || PAYMENT_METHODS[0];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomCode = '';
  for (let i = 0; i < 8; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${method.prefix}${randomCode}`;
}
