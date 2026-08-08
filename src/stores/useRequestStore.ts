/**
 * useRequestStore — Zustand Request Store (replaces RequestContext)
 * Manages emergency blood requests, donor responses, and fulfillment
 */
import { create } from 'zustand';
import {
  createFirestoreRequest,
  fulfillFirestoreRequest,
  updateFirestoreResponse,
} from '../firebase/firestoreService';
import type { BloodRequest, DonorResponse, UrgencyLevel, GeoLocation } from '../types';

// ─── Seeded Mock Data ────────────────────────────────────────
const INITIAL_REQUESTS: BloodRequest[] = [
  {
    id: 'req-101',
    hospitalId: 'hosp-demo-456',
    hospitalName: 'Nairobi National Hospital',
    bloodType: 'O+',
    urgency: 'critical',
    unitsNeeded: 3,
    location: { lat: -1.2921, lng: 36.8219, city: 'Upper Hill, Nairobi' },
    suggestedAmount: 1200,
    notes: 'Severe trauma patient emergency transfusion in ICU Ward 4.',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    responses: [
      {
        donorId: 'donor-demo-123',
        donorName: 'Sarah Connor',
        bloodType: 'O+',
        amountPaid: 1200,
        transactionId: 'MPESA-TRX88921',
        respondedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
      {
        donorId: 'donor-2',
        donorName: 'David Ochieng',
        bloodType: 'O+',
        amountPaid: 1000,
        transactionId: 'MPESA-QK90412A',
        respondedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
    ],
  },
  {
    id: 'req-102',
    hospitalId: 'hosp-demo-456',
    hospitalName: 'Nairobi National Hospital',
    bloodType: 'A-',
    urgency: 'medium',
    unitsNeeded: 2,
    location: { lat: -1.2921, lng: 36.8219, city: 'Upper Hill, Nairobi' },
    suggestedAmount: 950,
    notes: 'Scheduled bypass surgery unit preparation.',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    responses: [],
  },
  {
    id: 'req-100',
    hospitalId: 'hosp-demo-456',
    hospitalName: 'Nairobi National Hospital',
    bloodType: 'B+',
    urgency: 'low',
    unitsNeeded: 1,
    location: { lat: -1.2921, lng: 36.8219, city: 'Upper Hill, Nairobi' },
    suggestedAmount: 750,
    notes: 'Blood bank reserve replenishment.',
    status: 'fulfilled',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    responses: [
      {
        donorId: 'donor-3',
        donorName: 'Grace Wambui',
        bloodType: 'B+',
        amountPaid: 750,
        transactionId: 'MPESA-BW110943',
        respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      },
    ],
  },
];

// ─── Store Interface ─────────────────────────────────────────
export interface CreateRequestParams {
  bloodType: string;
  urgency: UrgencyLevel;
  unitsNeeded: string | number;
  suggestedAmount: string | number;
  notes?: string;
  location?: GeoLocation;
}

interface RequestState {
  requests: BloodRequest[];
  loading: boolean;

  // Actions
  createRequest: (params: CreateRequestParams) => Promise<BloodRequest>;
  markFulfilled: (requestId: string) => Promise<void>;
  addDonorResponse: (requestId: string, responseObj: DonorResponse) => Promise<void>;

  // Selectors
  getActiveRequests: () => BloodRequest[];
  getFulfilledRequests: () => BloodRequest[];
  getRequestById: (id: string) => BloodRequest | undefined;
}

// ─── Store ───────────────────────────────────────────────────
export const useRequestStore = create<RequestState>()((set, get) => ({
  requests: INITIAL_REQUESTS,
  loading: false,

  createRequest: async (params): Promise<BloodRequest> => {
    set({ loading: true });

    const newReq: BloodRequest = {
      id: 'req-' + Date.now().toString().slice(-6),
      hospitalId: 'hosp-demo-456',
      hospitalName: 'Emergency Medical Center',
      bloodType: params.bloodType,
      urgency: params.urgency,
      unitsNeeded: parseInt(String(params.unitsNeeded), 10) || 1,
      location: params.location || { lat: -1.2921, lng: 36.8219, city: 'Upper Hill, Nairobi' },
      suggestedAmount: parseInt(String(params.suggestedAmount), 10) || 1000,
      notes: params.notes || '',
      status: 'open',
      createdAt: new Date().toISOString(),
      responses: [],
    };

    try {
      const remoteRequest = await createFirestoreRequest(newReq);
      set((state) => ({
        requests: [remoteRequest, ...state.requests],
        loading: false,
      }));
      return remoteRequest;
    } catch {
      set((state) => ({
        requests: [newReq, ...state.requests],
        loading: false,
      }));
      return newReq;
    }
  },

  markFulfilled: async (requestId) => {
    set({ loading: true });

    try {
      await fulfillFirestoreRequest(requestId);
    } catch {
      // ignore and continue with local update
    }

    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === requestId ? { ...req, status: 'fulfilled' as const } : req
      ),
      loading: false,
    }));
  },

  addDonorResponse: async (requestId, responseObj) => {
    set({ loading: true });

    try {
      await updateFirestoreResponse(requestId, responseObj);
    } catch {
      // ignore and continue with local update
    }

    set((state) => ({
      requests: state.requests.map((req) => {
        if (req.id === requestId) {
          const existing = req.responses.filter((r) => r.donorId !== responseObj.donorId);
          return {
            ...req,
            responses: [...existing, responseObj],
          };
        }
        return req;
      }),
      loading: false,
    }));
  },

  getActiveRequests: () => get().requests.filter((r) => r.status === 'open'),
  getFulfilledRequests: () => get().requests.filter((r) => r.status === 'fulfilled'),
  getRequestById: (id) => get().requests.find((r) => r.id === id),
}));

// ─── Backward-Compatible Hook ────────────────────────────────
export function useRequests() {
  return useRequestStore();
}
