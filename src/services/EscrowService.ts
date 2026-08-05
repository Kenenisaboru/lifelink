/**
 * EscrowService — Escrow hold/release/refund logic for LifeLink payments
 */
import type { EscrowRecord, EscrowHoldResult, EscrowActionResult } from '../types';

const HOLD_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory ledger
const escrowLedger: Record<string, EscrowRecord> = {};

export interface HoldFundsParams {
  donorId: string;
  hospitalId: string;
  requestId: string;
  amount: number;
  transactionId: string;
}

/**
 * Create an escrow hold for a donation payment
 */
export function holdFunds({
  donorId,
  hospitalId,
  requestId,
  amount,
  transactionId,
}: HoldFundsParams): EscrowHoldResult {
  const escrowId = `ESC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const createdAt = Date.now();
  const releaseAt = createdAt + HOLD_TIMEOUT_MS;

  escrowLedger[escrowId] = {
    escrowId,
    donorId,
    hospitalId,
    requestId,
    amount,
    transactionId,
    status: 'held',
    createdAt,
    releaseAt,
    releasedAt: null,
    refundedAt: null,
  };

  // Auto-refund after 24h if not released
  setTimeout(() => {
    if (escrowLedger[escrowId]?.status === 'held') {
      autoRefund(escrowId);
    }
  }, HOLD_TIMEOUT_MS);

  return { escrowId, status: 'held', releaseAt: new Date(releaseAt).toISOString() };
}

/**
 * Release held funds to hospital upon QR check-in confirmation
 */
export function releaseFunds(escrowId: string, confirmedBy?: string): EscrowActionResult {
  const escrow = escrowLedger[escrowId];
  if (!escrow) return { success: false, message: 'Escrow record not found' };
  if (escrow.status !== 'held') return { success: false, message: `Escrow already ${escrow.status}` };

  escrowLedger[escrowId] = {
    ...escrow,
    status: 'released',
    releasedAt: Date.now(),
    confirmedBy,
  };

  console.log(`✅ ESCROW RELEASED: ${escrowId} — Amount ${escrow.amount} released to hospital`);
  return { success: true, message: 'Funds released successfully', escrow: escrowLedger[escrowId] };
}

/**
 * Auto-refund after 24h timeout (called internally)
 */
function autoRefund(escrowId: string): void {
  const escrow = escrowLedger[escrowId];
  if (!escrow || escrow.status !== 'held') return;

  escrowLedger[escrowId] = {
    ...escrow,
    status: 'refunded',
    refundedAt: Date.now(),
    refundReason: 'Auto-refund: 24h timeout without hospital check-in',
  };

  console.log(`🔄 ESCROW AUTO-REFUNDED: ${escrowId} — Donor refunded Amount ${escrow.amount}`);
}

/**
 * Manually trigger a refund (e.g. hospital cancelled request)
 */
export function manualRefund(escrowId: string, reason?: string): EscrowActionResult {
  const escrow = escrowLedger[escrowId];
  if (!escrow) return { success: false, message: 'Escrow record not found' };
  if (escrow.status !== 'held') return { success: false, message: `Cannot refund: status is ${escrow.status}` };

  escrowLedger[escrowId] = {
    ...escrow,
    status: 'refunded',
    refundedAt: Date.now(),
    refundReason: reason || 'Manual refund by hospital',
  };

  return { success: true, message: 'Refund initiated', escrow: escrowLedger[escrowId] };
}

/**
 * Get escrow record by ID
 */
export function getEscrow(escrowId: string): EscrowRecord | null {
  return escrowLedger[escrowId] || null;
}

/**
 * Get all escrow records for a request
 */
export function getEscrowByRequest(requestId: string): EscrowRecord[] {
  return Object.values(escrowLedger).filter((e) => e.requestId === requestId);
}

/**
 * Get human-readable time until auto-release
 */
export function getTimeUntilRelease(escrowId: string): string | null {
  const escrow = escrowLedger[escrowId];
  if (!escrow || escrow.status !== 'held') return null;
  const msLeft = escrow.releaseAt - Date.now();
  if (msLeft <= 0) return '< 1 min (expiring)';
  const hours = Math.floor(msLeft / 3600000);
  const mins = Math.floor((msLeft % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}
