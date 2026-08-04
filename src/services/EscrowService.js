/**
 * EscrowService — Escrow hold/release/refund logic for LifeLink payments
 *
 * Flow:
 *   1. Donor pays → funds held in escrow (status: 'held')
 *   2. Hospital scans donor QR on arrival → funds released (status: 'released')
 *   3. 24h timeout with no check-in → auto-refund (status: 'refunded')
 */

const ESCROW_LEDGER_KEY = '@lifelink_escrow_ledger';
const HOLD_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory ledger (replace with AsyncStorage / Firestore for persistence)
const escrowLedger = {};

/**
 * Create an escrow hold for a donation payment
 * @param {object} params
 * @param {string} params.donorId
 * @param {string} params.hospitalId
 * @param {string} params.requestId
 * @param {number} params.amount       - In ETB
 * @param {string} params.transactionId - From Telebirr / Chapa
 * @returns {{ escrowId, status, releaseAt }}
 */
export function holdFunds({ donorId, hospitalId, requestId, amount, transactionId }) {
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
 * @param {string} escrowId
 * @param {string} confirmedBy — Hospital staff user ID
 * @returns {{ success, message, escrow }}
 */
export function releaseFunds(escrowId, confirmedBy) {
  const escrow = escrowLedger[escrowId];
  if (!escrow) return { success: false, message: 'Escrow record not found' };
  if (escrow.status !== 'held') return { success: false, message: `Escrow already ${escrow.status}` };

  escrowLedger[escrowId] = {
    ...escrow,
    status: 'released',
    releasedAt: Date.now(),
    confirmedBy,
  };

  console.log(`✅ ESCROW RELEASED: ${escrowId} — KSh ${escrow.amount} released to hospital`);
  return { success: true, message: 'Funds released successfully', escrow: escrowLedger[escrowId] };
}

/**
 * Auto-refund after 24h timeout (called internally)
 */
function autoRefund(escrowId) {
  const escrow = escrowLedger[escrowId];
  if (!escrow || escrow.status !== 'held') return;

  escrowLedger[escrowId] = {
    ...escrow,
    status: 'refunded',
    refundedAt: Date.now(),
    refundReason: 'Auto-refund: 24h timeout without hospital check-in',
  };

  console.log(`🔄 ESCROW AUTO-REFUNDED: ${escrowId} — Donor refunded KSh ${escrow.amount}`);
}

/**
 * Manually trigger a refund (e.g. hospital cancelled request)
 */
export function manualRefund(escrowId, reason) {
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
export function getEscrow(escrowId) {
  return escrowLedger[escrowId] || null;
}

/**
 * Get all escrow records for a request
 */
export function getEscrowByRequest(requestId) {
  return Object.values(escrowLedger).filter((e) => e.requestId === requestId);
}

/**
 * Get human-readable time until auto-release
 */
export function getTimeUntilRelease(escrowId) {
  const escrow = escrowLedger[escrowId];
  if (!escrow || escrow.status !== 'held') return null;
  const msLeft = escrow.releaseAt - Date.now();
  if (msLeft <= 0) return '< 1 min (expiring)';
  const hours = Math.floor(msLeft / 3600000);
  const mins = Math.floor((msLeft % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}
