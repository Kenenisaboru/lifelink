import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  initializeAuth,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from 'firebase/auth';
import { firebaseConfig, firebaseEmulatorConfig } from './config';
import type { BloodType, DonorUser, GeoLocation, HospitalUser, User } from '../types';

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseInitialized = false;
let firebaseInitError: string | null = null;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      (!firebaseConfig.apiKey.includes('Demo') || firebaseEmulatorConfig.useEmulator) &&
      (!firebaseConfig.projectId.includes('demo') || firebaseEmulatorConfig.useEmulator)
  );
}

async function ensureFirebase(): Promise<void> {
  if (firebaseInitialized) return;

  if (!isFirebaseConfigured()) {
    firebaseInitError = 'Firebase is not configured. Falling back to demo mode.';
    firebaseInitialized = true;
    return;
  }

  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApp();
    }

    if (!firebaseAuth) {
      try {
        firebaseAuth = initializeAuth(firebaseApp);
      } catch {
        firebaseAuth = getAuth(firebaseApp);
      }
    }

    if (firebaseAuth && firebaseEmulatorConfig.useEmulator) {
      try {
        connectAuthEmulator(firebaseAuth, `http://${firebaseEmulatorConfig.authHost}:9099`);
      } catch {
        // Emulator already connected or unavailable
      }
    }

    firebaseInitialized = true;
    firebaseInitError = null;
  } catch (error) {
    firebaseInitError = error instanceof Error ? error.message : 'Unable to initialize Firebase';
    firebaseInitialized = true;
  }
}

function inferRole(email: string): 'donor' | 'hospital' {
  const normalized = email.trim().toLowerCase();
  return /hospital|clinic|health/.test(normalized) ? 'hospital' : 'donor';
}

function buildFallbackUser(email: string, role: 'donor' | 'hospital'): User {
  const normalizedEmail = email.trim().toLowerCase();
  const baseLocation: GeoLocation = { lat: -1.286389, lng: 36.817223, city: 'Nairobi CBD' };

  if (role === 'hospital') {
    const hospitalUser: HospitalUser = {
      uid: `demo-hospital-${Date.now()}`,
      email: normalizedEmail,
      name: normalizedEmail.split('@')[0].replace('.', ' ').toUpperCase(),
      role: 'hospital',
      hospitalName: 'Medical Emergency Center',
      location: baseLocation,
    };
    return hospitalUser;
  }

  const donorUser: DonorUser = {
    uid: `demo-donor-${Date.now()}`,
    email: normalizedEmail,
    name: normalizedEmail.split('@')[0].replace('.', ' ').toUpperCase(),
    role: 'donor',
    bloodType: 'O+',
    available: true,
    location: baseLocation,
  };

  return donorUser;
}

export async function initializeFirebase(): Promise<void> {
  await ensureFirebase();
}

export function getFirebaseInitError(): string | null {
  return firebaseInitError;
}

export async function loginWithFirebase(email: string, password: string): Promise<User> {
  await ensureFirebase();

  if (!firebaseAuth || !isFirebaseConfigured()) {
    const role = inferRole(email);
    return buildFallbackUser(email, role);
  }

  const credentials = await signInWithEmailAndPassword(firebaseAuth, email, password);
  const role = inferRole(credentials.user.email ?? email);

  return buildFallbackUser(credentials.user.email ?? email, role);
}

export async function registerWithFirebase(userData: {
  email: string;
  name: string;
  role: 'donor' | 'hospital';
  bloodType?: BloodType;
  hospitalName?: string;
  location?: GeoLocation;
  password: string;
}): Promise<User> {
  await ensureFirebase();

  if (!firebaseAuth || !isFirebaseConfigured()) {
    return buildFallbackUser(userData.email, userData.role);
  }

  const credentials = await createUserWithEmailAndPassword(
    firebaseAuth,
    userData.email,
    userData.password
  );

  const normalizedEmail = credentials.user.email ?? userData.email;
  const baseLocation = userData.location || { lat: -1.286389, lng: 36.817223, city: 'Nairobi' };

  if (userData.role === 'hospital') {
    const hospitalUser: HospitalUser = {
      uid: credentials.user.uid,
      email: normalizedEmail,
      name: userData.name,
      role: 'hospital',
      hospitalName: userData.hospitalName || 'Medical Emergency Center',
      location: baseLocation,
    };
    return hospitalUser;
  }

  const donorUser: DonorUser = {
    uid: credentials.user.uid,
    email: normalizedEmail,
    name: userData.name,
    role: 'donor',
    bloodType: userData.bloodType || 'O+',
    available: true,
    location: baseLocation,
  };

  return donorUser;
}

export async function logoutFromFirebase(): Promise<void> {
  if (!firebaseAuth) return;
  await signOut(firebaseAuth);
}
