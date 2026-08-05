/**
 * LifeLink — Type-Safe Navigation Param Lists
 * Provides compile-time route + param validation for React Navigation
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BloodRequest } from './index';

// ─── Root Stack ──────────────────────────────────────────────
export type RootStackParamList = {
  // Auth Screens
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;

  // Donor Screens
  DonorDashboard: undefined;
  Payment: { request: BloodRequest; distanceKm: number };
  DonorPassport: undefined;
  Leaderboard: undefined;

  // Hospital Screens
  HospitalDashboard: undefined;
  CreateRequest: undefined;
  ResponseTracker: { requestId: string };
  BloodInventory: undefined;
  RegionalHeatmap: undefined;
  QRCheckIn: undefined;

  // Shared Screens
  LiveMap: undefined;
};

// ─── Screen Props Helpers ────────────────────────────────────
export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Convenience aliases for common screens
export type WelcomeScreenProps = ScreenProps<'Welcome'>;
export type LoginScreenProps = ScreenProps<'Login'>;
export type SignupScreenProps = ScreenProps<'Signup'>;
export type DonorDashboardScreenProps = ScreenProps<'DonorDashboard'>;
export type PaymentScreenProps = ScreenProps<'Payment'>;
export type DonorPassportScreenProps = ScreenProps<'DonorPassport'>;
export type LeaderboardScreenProps = ScreenProps<'Leaderboard'>;
export type HospitalDashboardScreenProps = ScreenProps<'HospitalDashboard'>;
export type CreateRequestScreenProps = ScreenProps<'CreateRequest'>;
export type ResponseTrackerScreenProps = ScreenProps<'ResponseTracker'>;
export type BloodInventoryScreenProps = ScreenProps<'BloodInventory'>;
export type RegionalHeatmapScreenProps = ScreenProps<'RegionalHeatmap'>;
export type QRCheckInScreenProps = ScreenProps<'QRCheckIn'>;
export type LiveMapScreenProps = ScreenProps<'LiveMap'>;
