/**
 * useAuthStore — Zustand Auth Store (replaces AuthContext)
 * Manages user authentication, session persistence, and profile updates
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginWithFirebase, logoutFromFirebase, registerWithFirebase } from '../firebase/authService';
import type { User, DonorUser, HospitalUser, GeoLocation, BloodType } from '../types';

// ─── Demo Users ──────────────────────────────────────────────
export const DEMO_USERS = {
  donor: {
    uid: 'donor-demo-123',
    email: 'donor@demo.com',
    name: 'Sarah Connor',
    role: 'donor' as const,
    bloodType: 'O+' as BloodType,
    available: true,
    location: { lat: -1.286389, lng: 36.817223, city: 'Nairobi CBD' },
  } satisfies DonorUser,
  hospital: {
    uid: 'hosp-demo-456',
    email: 'hospital@demo.com',
    name: 'Dr. James Kariuki',
    role: 'hospital' as const,
    hospitalName: 'Nairobi National Hospital',
    location: { lat: -1.2921, lng: 36.8219, city: 'Upper Hill, Nairobi' },
  } satisfies HospitalUser,
};

// ─── Store Interface ─────────────────────────────────────────
interface AuthState {
  user: User | null;
  loading: boolean;
  authError: string | null;

  // Actions
  setAuthError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<User>;
  signup: (userData: {
    email: string;
    name: string;
    role: 'donor' | 'hospital';
    bloodType?: BloodType;
    hospitalName?: string;
    location?: GeoLocation;
    password: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  toggleAvailability: () => void;
  setLoading: (loading: boolean) => void;
}

// ─── Store ───────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      authError: null,

      setAuthError: (error) => set({ authError: error }),
      setLoading: (loading) => set({ loading }),

      login: async (email: string, password: string): Promise<User> => {
        set({ loading: true, authError: null });

        try {
          const authenticatedUser = await loginWithFirebase(email, password);
          set({ user: authenticatedUser, loading: false });
          return authenticatedUser;
        } catch (error) {
          const trimmedEmail = email.trim().toLowerCase();
          const currentUser = get().user;
          if (currentUser && currentUser.email === trimmedEmail) {
            set({ loading: false });
            return currentUser;
          }

          const isHospital =
            trimmedEmail.includes('hospital') ||
            trimmedEmail.includes('clinic') ||
            trimmedEmail.includes('health');

          const authenticatedUser: User = isHospital
            ? {
                uid: 'usr_' + Math.random().toString(36).substring(2, 9),
                email: trimmedEmail,
                name: trimmedEmail.split('@')[0].replace('.', ' ').toUpperCase(),
                role: 'hospital' as const,
                hospitalName: 'Medical Emergency Center',
                location: { lat: -1.286389, lng: 36.817223, city: 'Nairobi CBD' },
              }
            : {
                uid: 'usr_' + Math.random().toString(36).substring(2, 9),
                email: trimmedEmail,
                name: trimmedEmail.split('@')[0].replace('.', ' ').toUpperCase(),
                role: 'donor' as const,
                bloodType: 'O+' as BloodType,
                available: true,
                location: { lat: -1.286389, lng: 36.817223, city: 'Nairobi CBD' },
              };

          set({ user: authenticatedUser, loading: false });
          return authenticatedUser;
        }
      },

      signup: async (userData): Promise<User> => {
        set({ loading: true, authError: null });

        try {
          const newUser = await registerWithFirebase({
            email: userData.email,
            name: userData.name,
            role: userData.role,
            bloodType: userData.bloodType,
            hospitalName: userData.hospitalName,
            location: userData.location,
            password: userData.password,
          });
          set({ user: newUser, loading: false });
          return newUser;
        } catch (error) {
          const newUser: User =
            userData.role === 'hospital'
              ? {
                  uid: 'user-' + Date.now(),
                  email: userData.email.trim().toLowerCase(),
                  name: userData.name,
                  role: 'hospital' as const,
                  hospitalName: userData.hospitalName || '',
                  location: userData.location || { lat: -1.286389, lng: 36.817223, city: 'Nairobi' },
                }
              : {
                  uid: 'user-' + Date.now(),
                  email: userData.email.trim().toLowerCase(),
                  name: userData.name,
                  role: 'donor' as const,
                  bloodType: (userData.bloodType || 'O+') as BloodType,
                  available: true,
                  location: userData.location || { lat: -1.286389, lng: 36.817223, city: 'Nairobi' },
                };

          set({ user: newUser, loading: false });
          return newUser;
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await logoutFromFirebase();
        } catch {
          // ignore, fall back to local logout
        }
        set({ user: null, loading: false });
      },

      updateProfile: (updates) => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({ user: { ...currentUser, ...updates } as User });
      },

      toggleAvailability: () => {
        const currentUser = get().user;
        if (!currentUser || currentUser.role !== 'donor') return;
        set({
          user: {
            ...currentUser,
            available: !(currentUser as DonorUser).available,
          } as DonorUser,
        });
      },
    }),
    {
      name: '@lifelink_user_session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// ─── Backward-Compatible Hook ────────────────────────────────
export function useAuth() {
  return useAuthStore();
}
