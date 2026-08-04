import React, { createContext, useState, useContext } from 'react';
import { useAuth } from './AuthContext';

const RequestContext = createContext();

// Seeded initial mock emergency blood requests for judge/demo testing
const INITIAL_REQUESTS = [
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
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
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

export function RequestProvider({ children }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [loading, setLoading] = useState(false);

  // Hospital posts a new emergency request
  const createRequest = async ({ bloodType, urgency, unitsNeeded, suggestedAmount, notes, location }) => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 600)); // simulate network write

    const newReq = {
      id: 'req-' + Date.now().toString().slice(-6),
      hospitalId: user?.uid || 'hosp-demo-456',
      hospitalName: user?.hospitalName || user?.name || 'Emergency Medical Center',
      bloodType,
      urgency, // 'low' | 'medium' | 'critical'
      unitsNeeded: parseInt(unitsNeeded, 10) || 1,
      location: location || user?.location || { lat: -1.2921, lng: 36.8219, city: 'Upper Hill, Nairobi' },
      suggestedAmount: parseInt(suggestedAmount, 10) || 1000,
      notes: notes || '',
      status: 'open',
      createdAt: new Date().toISOString(),
      responses: [],
    };

    setRequests((prev) => [newReq, ...prev]);
    setLoading(false);
    return newReq;
  };

  // Hospital marks request as fulfilled
  const markFulfilled = async (requestId) => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 400));

    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: 'fulfilled' } : req
      )
    );
    setLoading(false);
  };

  // Donor responds with payment details
  const addDonorResponse = async (requestId, responseObj) => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 500));

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          // Check if donor already responded
          const existing = req.responses.filter((r) => r.donorId !== responseObj.donorId);
          return {
            ...req,
            responses: [...existing, responseObj],
          };
        }
        return req;
      })
    );
    setLoading(false);
  };

  const getActiveRequests = () => requests.filter((r) => r.status === 'open');
  const getFulfilledRequests = () => requests.filter((r) => r.status === 'fulfilled');
  const getRequestById = (id) => requests.find((r) => r.id === id);

  return (
    <RequestContext.Provider
      value={{
        requests,
        loading,
        createRequest,
        markFulfilled,
        addDonorResponse,
        getActiveRequests,
        getFulfilledRequests,
        getRequestById,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
}

export function useRequests() {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
}
