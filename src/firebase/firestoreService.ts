import { getApp } from 'firebase/app';
import {
  addDoc,
  arrayUnion,
  collection,
  connectFirestoreEmulator,
  doc,
  getFirestore,
  onSnapshot,
  query,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import { initializeFirebase, isFirebaseConfigured } from './authService';
import { firebaseEmulatorConfig } from './config';
import type { BloodRequest, DonorResponse } from '../types';

let firestoreDb: Firestore | null = null;

async function ensureFirestore(): Promise<Firestore | null> {
  await initializeFirebase();

  if (!isFirebaseConfigured()) {
    return null;
  }

  if (!firestoreDb) {
    firestoreDb = getFirestore(getApp());

    if (firebaseEmulatorConfig.useEmulator) {
      try {
        connectFirestoreEmulator(
          firestoreDb,
          firebaseEmulatorConfig.firestoreHost,
          firebaseEmulatorConfig.firestorePort
        );
      } catch {
        // Emulator already connected or unavailable
      }
    }
  }

  return firestoreDb;
}

export function subscribeToOpenRequests(callback: (requests: BloodRequest[]) => void): () => void {
  void ensureFirestore().then((db) => {
    if (!db) {
      callback([]);
      return;
    }

    const q = query(collection(db, 'requests'), where('status', '==', 'open'));
    onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...(docSnapshot.data() as Partial<BloodRequest>),
        }) as BloodRequest);
        callback(requests);
      },
      () => {
        callback([]);
      }
    );
  });

  return () => undefined;
}

export async function createFirestoreRequest(requestData: Partial<BloodRequest>): Promise<BloodRequest> {
  const db = await ensureFirestore();
  if (!db) {
    return { id: `req-${Date.now()}`, ...requestData } as BloodRequest;
  }

  const payload = {
    hospitalId: requestData.hospitalId || 'demo-hospital',
    hospitalName: requestData.hospitalName || 'Emergency Medical Center',
    bloodType: requestData.bloodType || 'O+',
    urgency: requestData.urgency || 'critical',
    unitsNeeded: requestData.unitsNeeded || 1,
    location: requestData.location || { lat: -1.286389, lng: 36.817223, city: 'Nairobi' },
    suggestedAmount: requestData.suggestedAmount || 1000,
    notes: requestData.notes || '',
    status: 'open',
    createdAt: new Date().toISOString(),
    responses: [],
    notified: false,
  };

  const docRef = await addDoc(collection(db, 'requests'), payload);
  return { id: docRef.id, ...payload } as BloodRequest;
}

export async function updateFirestoreResponse(requestId: string, responseData: DonorResponse): Promise<void> {
  const db = await ensureFirestore();
  if (!db) return;

  const requestRef = doc(db, 'requests', requestId);
  await updateDoc(requestRef, {
    responses: arrayUnion(responseData),
    updatedAt: new Date().toISOString(),
  });
}

export async function fulfillFirestoreRequest(requestId: string): Promise<void> {
  const db = await ensureFirestore();
  if (!db) return;

  const requestRef = doc(db, 'requests', requestId);
  await updateDoc(requestRef, {
    status: 'fulfilled',
    fulfilledAt: new Date().toISOString(),
  });
}
