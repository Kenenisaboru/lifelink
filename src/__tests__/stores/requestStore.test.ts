/**
 * Unit Tests — Request Store State Transitions
 */
import { act } from 'react';
import { useRequestStore } from '../../stores/useRequestStore';

// Reset store before each test to avoid state bleed
beforeEach(() => {
  useRequestStore.setState({
    requests: [],
    loading: false,
  });
});

describe('useRequestStore', () => {
  describe('createRequest', () => {
    it('adds a new request to the store', async () => {
      await act(async () => {
        await useRequestStore.getState().createRequest({
          bloodType: 'O+',
          urgency: 'critical',
          unitsNeeded: 3,
          suggestedAmount: 1200,
          notes: 'ICU emergency',
        });
      });
      const { requests } = useRequestStore.getState();
      expect(requests).toHaveLength(1);
      expect(requests[0].bloodType).toBe('O+');
      expect(requests[0].urgency).toBe('critical');
      expect(requests[0].status).toBe('open');
    });

    it('sets loading to false after creation', async () => {
      await act(async () => {
        await useRequestStore.getState().createRequest({
          bloodType: 'A-',
          urgency: 'medium',
          unitsNeeded: 2,
          suggestedAmount: 900,
        });
      });
      expect(useRequestStore.getState().loading).toBe(false);
    });

    it('prepends new requests to the top of the list', async () => {
      await act(async () => {
        await useRequestStore.getState().createRequest({
          bloodType: 'A+',
          urgency: 'low',
          unitsNeeded: 1,
          suggestedAmount: 500,
        });
        await useRequestStore.getState().createRequest({
          bloodType: 'B+',
          urgency: 'critical',
          unitsNeeded: 2,
          suggestedAmount: 1000,
        });
      });
      const { requests } = useRequestStore.getState();
      expect(requests[0].bloodType).toBe('B+');
      expect(requests[1].bloodType).toBe('A+');
    });

    it('generates a unique ID for each request', async () => {
      await act(async () => {
        await useRequestStore.getState().createRequest({
          bloodType: 'O-',
          urgency: 'critical',
          unitsNeeded: 1,
          suggestedAmount: 800,
        });
        await useRequestStore.getState().createRequest({
          bloodType: 'O-',
          urgency: 'critical',
          unitsNeeded: 1,
          suggestedAmount: 800,
        });
      });
      const { requests } = useRequestStore.getState();
      expect(requests[0].id).not.toBe(requests[1].id);
    });
  });

  describe('markFulfilled', () => {
    it('transitions an open request to fulfilled', async () => {
      let reqId = '';
      await act(async () => {
        const req = await useRequestStore.getState().createRequest({
          bloodType: 'O+',
          urgency: 'critical',
          unitsNeeded: 2,
          suggestedAmount: 1000,
        });
        reqId = req.id;
      });

      await act(async () => {
        await useRequestStore.getState().markFulfilled(reqId);
      });

      const req = useRequestStore.getState().getRequestById(reqId);
      expect(req?.status).toBe('fulfilled');
    });

    it('does not affect other requests', async () => {
      let req1Id = '';
      await act(async () => {
        const req1 = await useRequestStore.getState().createRequest({
          bloodType: 'A+',
          urgency: 'medium',
          unitsNeeded: 1,
          suggestedAmount: 600,
        });
        req1Id = req1.id;
        await useRequestStore.getState().createRequest({
          bloodType: 'B+',
          urgency: 'low',
          unitsNeeded: 1,
          suggestedAmount: 500,
        });
      });

      await act(async () => {
        await useRequestStore.getState().markFulfilled(req1Id);
      });

      const allRequests = useRequestStore.getState().requests;
      const openRequests = allRequests.filter((r) => r.status === 'open');
      expect(openRequests).toHaveLength(1);
      expect(openRequests[0].bloodType).toBe('B+');
    });
  });

  describe('addDonorResponse', () => {
    it('adds a response to the correct request', async () => {
      let reqId = '';
      await act(async () => {
        const req = await useRequestStore.getState().createRequest({
          bloodType: 'O+',
          urgency: 'critical',
          unitsNeeded: 2,
          suggestedAmount: 1200,
        });
        reqId = req.id;
      });

      const response = {
        donorId: 'donor-001',
        donorName: 'Sarah Connor',
        bloodType: 'O+',
        amountPaid: 1200,
        transactionId: 'MPESA-TEST001',
        respondedAt: new Date().toISOString(),
      };

      await act(async () => {
        await useRequestStore.getState().addDonorResponse(reqId, response);
      });

      const req = useRequestStore.getState().getRequestById(reqId);
      expect(req?.responses).toHaveLength(1);
      expect(req?.responses[0].donorId).toBe('donor-001');
      expect(req?.responses[0].transactionId).toBe('MPESA-TEST001');
    });

    it('prevents duplicate donor responses (deduplicates by donorId)', async () => {
      let reqId = '';
      await act(async () => {
        const req = await useRequestStore.getState().createRequest({
          bloodType: 'A-',
          urgency: 'medium',
          unitsNeeded: 1,
          suggestedAmount: 700,
        });
        reqId = req.id;
      });

      const response = {
        donorId: 'donor-002',
        donorName: 'John Doe',
        bloodType: 'A-',
        amountPaid: 700,
        transactionId: 'TELEBIRR-FIRST',
        respondedAt: new Date().toISOString(),
      };

      await act(async () => {
        await useRequestStore.getState().addDonorResponse(reqId, response);
        await useRequestStore.getState().addDonorResponse(reqId, {
          ...response,
          transactionId: 'TELEBIRR-SECOND',
        });
      });

      const req = useRequestStore.getState().getRequestById(reqId);
      // Should only have the latest response from this donor
      const donorResponses = req?.responses.filter((r) => r.donorId === 'donor-002');
      expect(donorResponses).toHaveLength(1);
    });
  });

  describe('selectors', () => {
    it('getActiveRequests returns only open requests', async () => {
      await act(async () => {
        const req = await useRequestStore.getState().createRequest({
          bloodType: 'O+',
          urgency: 'critical',
          unitsNeeded: 1,
          suggestedAmount: 800,
        });
        await useRequestStore.getState().createRequest({
          bloodType: 'A+',
          urgency: 'low',
          unitsNeeded: 1,
          suggestedAmount: 500,
        });
        await useRequestStore.getState().markFulfilled(req.id);
      });

      const active = useRequestStore.getState().getActiveRequests();
      expect(active).toHaveLength(1);
      expect(active[0].bloodType).toBe('A+');
    });

    it('getFulfilledRequests returns only fulfilled requests', async () => {
      await act(async () => {
        const req = await useRequestStore.getState().createRequest({
          bloodType: 'B-',
          urgency: 'medium',
          unitsNeeded: 2,
          suggestedAmount: 900,
        });
        await useRequestStore.getState().markFulfilled(req.id);
      });

      const fulfilled = useRequestStore.getState().getFulfilledRequests();
      expect(fulfilled).toHaveLength(1);
      expect(fulfilled[0].status).toBe('fulfilled');
    });

    it('getRequestById returns the correct request', async () => {
      let reqId = '';
      await act(async () => {
        const req = await useRequestStore.getState().createRequest({
          bloodType: 'AB+',
          urgency: 'critical',
          unitsNeeded: 3,
          suggestedAmount: 1500,
        });
        reqId = req.id;
      });

      const found = useRequestStore.getState().getRequestById(reqId);
      expect(found).toBeDefined();
      expect(found?.bloodType).toBe('AB+');
    });

    it('getRequestById returns undefined for unknown ID', () => {
      const found = useRequestStore.getState().getRequestById('req-does-not-exist');
      expect(found).toBeUndefined();
    });
  });
});
