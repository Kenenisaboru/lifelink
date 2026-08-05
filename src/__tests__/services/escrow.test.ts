/**
 * Unit Tests — Escrow Service (hold, release, refund, state transitions)
 */
import {
  holdFunds,
  releaseFunds,
  manualRefund,
  getEscrow,
  getEscrowByRequest,
} from '../../services/EscrowService';

describe('EscrowService', () => {
  const baseParams = {
    donorId: 'donor-001',
    hospitalId: 'hosp-001',
    requestId: 'req-001',
    amount: 1200,
    transactionId: 'TELEBIRR-TEST1234',
  };

  describe('holdFunds', () => {
    it('creates an escrow record with held status', () => {
      const result = holdFunds(baseParams);
      expect(result.status).toBe('held');
      expect(result.escrowId).toMatch(/^ESC-/);
      expect(result.releaseAt).toBeTruthy();
    });

    it('sets releaseAt to 24 hours in the future', () => {
      const before = Date.now();
      const result = holdFunds({ ...baseParams, transactionId: 'TRX-TIME-TEST' });
      const releaseTime = new Date(result.releaseAt).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      expect(releaseTime - before).toBeGreaterThanOrEqual(twentyFourHours - 100);
      expect(releaseTime - before).toBeLessThanOrEqual(twentyFourHours + 1000);
    });

    it('persists the record so getEscrow can retrieve it', () => {
      const result = holdFunds({ ...baseParams, transactionId: 'TRX-PERSIST' });
      const record = getEscrow(result.escrowId);
      expect(record).not.toBeNull();
      expect(record?.donorId).toBe(baseParams.donorId);
      expect(record?.amount).toBe(baseParams.amount);
      expect(record?.status).toBe('held');
    });

    it('generates unique escrow IDs for concurrent calls', () => {
      const ids = new Set(
        Array.from({ length: 10 }, (_, i) =>
          holdFunds({ ...baseParams, transactionId: `TRX-UNIQ-${i}` }).escrowId
        )
      );
      expect(ids.size).toBe(10);
    });
  });

  describe('releaseFunds', () => {
    it('transitions held escrow to released', () => {
      const hold = holdFunds({ ...baseParams, transactionId: 'TRX-RELEASE-1' });
      const result = releaseFunds(hold.escrowId, 'hospital-staff-001');
      expect(result.success).toBe(true);
      expect(result.escrow?.status).toBe('released');
      expect(result.escrow?.releasedAt).not.toBeNull();
      expect(result.escrow?.confirmedBy).toBe('hospital-staff-001');
    });

    it('fails for non-existent escrow ID', () => {
      const result = releaseFunds('ESC-DOES-NOT-EXIST');
      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('fails if escrow is already released', () => {
      const hold = holdFunds({ ...baseParams, transactionId: 'TRX-DOUBLE-RELEASE' });
      releaseFunds(hold.escrowId);
      const second = releaseFunds(hold.escrowId);
      expect(second.success).toBe(false);
      expect(second.message).toContain('released');
    });

    it('fails if escrow is already refunded', () => {
      const hold = holdFunds({ ...baseParams, transactionId: 'TRX-REFUND-THEN-RELEASE' });
      manualRefund(hold.escrowId);
      const releaseAttempt = releaseFunds(hold.escrowId);
      expect(releaseAttempt.success).toBe(false);
    });
  });

  describe('manualRefund', () => {
    it('transitions held escrow to refunded', () => {
      const hold = holdFunds({ ...baseParams, transactionId: 'TRX-MANUAL-REFUND' });
      const result = manualRefund(hold.escrowId, 'Hospital cancelled request');
      expect(result.success).toBe(true);
      expect(result.escrow?.status).toBe('refunded');
      expect(result.escrow?.refundedAt).not.toBeNull();
      expect(result.escrow?.refundReason).toBe('Hospital cancelled request');
    });

    it('fails if escrow is already released', () => {
      const hold = holdFunds({ ...baseParams, transactionId: 'TRX-RELEASED-REFUND' });
      releaseFunds(hold.escrowId);
      const refundAttempt = manualRefund(hold.escrowId);
      expect(refundAttempt.success).toBe(false);
    });

    it('uses default reason if none provided', () => {
      const hold = holdFunds({ ...baseParams, transactionId: 'TRX-DEFAULT-REASON' });
      const result = manualRefund(hold.escrowId);
      expect(result.escrow?.refundReason).toBeTruthy();
    });
  });

  describe('getEscrowByRequest', () => {
    it('returns all escrow records for a request', () => {
      const reqId = 'req-multi-' + Date.now();
      holdFunds({ ...baseParams, requestId: reqId, transactionId: 'TRX-MULTI-1' });
      holdFunds({ ...baseParams, requestId: reqId, transactionId: 'TRX-MULTI-2' });

      const records = getEscrowByRequest(reqId);
      expect(records.length).toBeGreaterThanOrEqual(2);
      records.forEach((r) => expect(r.requestId).toBe(reqId));
    });

    it('returns empty array for unknown requestId', () => {
      expect(getEscrowByRequest('req-nonexistent-xyz')).toEqual([]);
    });
  });

  describe('state transition invariants', () => {
    it('held → released → cannot refund (final state)', () => {
      const hold = holdFunds({ ...baseParams, transactionId: 'TRX-FSM-1' });
      releaseFunds(hold.escrowId);
      const refund = manualRefund(hold.escrowId);
      expect(refund.success).toBe(false);
    });

    it('held → refunded → cannot release (final state)', () => {
      const hold = holdFunds({ ...baseParams, transactionId: 'TRX-FSM-2' });
      manualRefund(hold.escrowId);
      const release = releaseFunds(hold.escrowId);
      expect(release.success).toBe(false);
    });
  });
});
